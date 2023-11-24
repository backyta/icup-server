import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validateName } from './validate-name.helper';
import { SearchFullnameOptions } from '../interfaces/search-fullname.interface';
import { Member } from '../../members/entities/member.entity';

export const searchFullname = async ({
  term,
  limit,
  offset,
  repository,
}: SearchFullnameOptions): Promise<Member[]> => {
  if (!term.includes('-')) {
    throw new BadRequestException(
      `Term not valid, use allow '-' for concatc firstname and lastname`,
    );
  }

  const [first, second] = term.split('-');
  const firstName = validateName(first);
  const lastName = validateName(second);

  const queryBuilder = repository.createQueryBuilder();
  const member = await queryBuilder
    .where(`first_name ILIKE :searchTerm1`, {
      searchTerm1: `%${firstName}%`,
    })
    .andWhere(`last_name ILIKE :searchTerm2`, {
      searchTerm2: `%${lastName}%`,
    })
    .skip(offset)
    .limit(limit)
    .getMany();

  if (member.length === 0) {
    throw new NotFoundException(
      `No member was found with these names: ${firstName} ${lastName}`,
    );
  }
  return member;
};

//? What does this?
//? /^[^+]+(?:\+[^+]+)*\+$/.

//! This Regex validates:
//* No comienze con signo +
//* termina con signo +
//* Puede tener múltiples secciones que consisten en un "+" seguido de uno o más caracteres que no sean un "+".

//! For example:
//* hola+mundo+
//* a+b+c+d+
//* 123+456+789+
