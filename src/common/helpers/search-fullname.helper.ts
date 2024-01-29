import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Member } from '../../members/entities/member.entity';

import { validateName } from './validate-name.helper';
import { SearchFullNameOptions } from '../interfaces/search-fullname.interface';

export const searchByFullname = async ({
  term,
  limit,
  offset,
  search_repository,
}: SearchFullNameOptions<Member>): Promise<Member[]> => {
  if (!term.includes('-')) {
    throw new BadRequestException(
      `Term not valid, use allow '-' for concat first name and last name`,
    );
  }

  const [first, second] = term.split('-');
  const firstName = validateName(first);
  const lastName = validateName(second);

  const queryBuilder = search_repository.createQueryBuilder('member');
  const members = await queryBuilder
    .leftJoinAndSelect('member.their_pastor', 'rel1')
    .leftJoinAndSelect('member.their_copastor', 'rel2')
    .leftJoinAndSelect('member.their_preacher', 'rel3')
    .leftJoinAndSelect('member.their_family_home', 'rel4')
    .where(`member.first_name ILIKE :searchTerm1`, {
      searchTerm1: `%${firstName}%`,
    })
    .andWhere(`member.last_name ILIKE :searchTerm2`, {
      searchTerm2: `%${lastName}%`,
    })
    .skip(offset)
    .andWhere(`member.is_active =:isActive`, { isActive: true })
    .limit(limit)
    .getMany();

  if (members.length === 0) {
    throw new NotFoundException(
      `No members was found with these names: ${firstName} ${lastName}`,
    );
  }
  return members;
};

//? What does this?
//? /^[^+]+(?:\+[^+]+)*\+$/.

//! This Regex validates:
//* No comienza con signo +
//* termina con signo +
//* Puede tener múltiples secciones que consisten en un "+" seguido de uno o más caracteres que no sean un "+".

//! For example:
//* hola+mundo+
//* a+b+c+d+
//* 123+456+789+
