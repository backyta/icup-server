import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SearchNamesOptions } from '@/common/interfaces';
import { User } from '@/modules/user/entities';

export const searchUserByNames = async ({
  term,
  search_type,
  limit,
  offset,
  search_repository,
}: SearchNamesOptions<User>): Promise<User[]> => {
  let dataPerson: string | string[];

  if (/^[A-Za-z]+(?:\+[A-Za-z]+)*\+$/.test(term)) {
    const arrayData = term.split('+');

    if (arrayData.length === 2 && arrayData.includes('')) {
      dataPerson = arrayData.join('');
    } else if (arrayData.length >= 3 && arrayData.includes('')) {
      dataPerson = arrayData.slice(0, -1);
      dataPerson = dataPerson.join(' ');
    } else {
      dataPerson = arrayData.join(' ');
    }
  } else {
    throw new BadRequestException(
      `Invalid term, only use it to concatenate '+' to the end of the word, do not use '-'`,
    );
  }

  const queryBuilder = search_repository.createQueryBuilder('user');
  const users = await queryBuilder
    .where(`user.${search_type} ILIKE :searchTerm`, {
      searchTerm: `%${dataPerson}%`,
    })
    .andWhere(`user.is_active =:isActive`, { isActive: true })
    .skip(offset)
    .limit(limit)
    .getMany();

  if (users.length === 0) {
    throw new NotFoundException(
      `No users was found with these ${search_type}: ${dataPerson}`,
    );
  }
  return users;
};

//? What does this?
//? /^[A-Za-z]+(?:\+[A-Za-z]+)*\+$/

//! This Regex validates:
//* Que la cadena no comience con un signo + o cualquier carácter especial, solo letras.
//* Que no esté vacía y que comience con una o más letras.
//* Que después de la primera letra, puede haber cero o más secuencias de un + seguido por una o más letras, pero estas secuencias no se capturan.
//* Que la cadena termine con un signo +.

//! For example:
//* Kevin+
//* a+b+c+
//* Hola+Mundo+
