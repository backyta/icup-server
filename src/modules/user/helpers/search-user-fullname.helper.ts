import { BadRequestException, NotFoundException } from '@nestjs/common';

import { validateName } from '@/common/helpers';
import { SearchFullNameOptions } from '@/common/interfaces';

import { User } from '@/modules/user/entities';

export const searchUserByFullname = async ({
  term,
  limit,
  offset,
  search_repository,
}: SearchFullNameOptions<User>): Promise<User[]> => {
  if (!term.includes('-')) {
    throw new BadRequestException(
      `Term not valid, use allow '-' for concat first name and last name`,
    );
  }

  const [first, second] = term.split('-');
  const firstName = validateName(first);
  const lastName = validateName(second);

  const queryBuilder = search_repository.createQueryBuilder('user');
  const users = await queryBuilder
    .where(`user.first_name ILIKE :searchTerm1`, {
      searchTerm1: `%${firstName}%`,
    })
    .andWhere(`user.last_name ILIKE :searchTerm2`, {
      searchTerm2: `%${lastName}%`,
    })
    .skip(offset)
    .andWhere(`user.is_active =:isActive`, { isActive: true })
    .limit(limit)
    .getMany();

  if (users.length === 0) {
    throw new NotFoundException(
      `No users was found with these names: ${firstName} ${lastName}`,
    );
  }
  return users;
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
