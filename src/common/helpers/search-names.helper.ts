import { BadRequestException, NotFoundException } from '@nestjs/common';

import { Member } from '../../members/entities/member.entity';

import { SearchNamesOptions } from '../interfaces/search-names.interface';

export const searchByNames = async ({
  term,
  search_type,
  limit,
  offset,
  search_repository,
}: SearchNamesOptions<Member>): Promise<Member[]> => {
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

  const queryBuilder = search_repository.createQueryBuilder('member');
  const member = await queryBuilder
    .leftJoinAndSelect('member.their_pastor', 'rel1')
    .leftJoinAndSelect('member.their_copastor', 'rel2')
    .leftJoinAndSelect('member.their_preacher', 'rel3')
    .leftJoinAndSelect('member.their_family_home', 'rel4')
    .where(`member.${search_type} ILIKE :searchTerm`, {
      searchTerm: `%${dataPerson}%`,
    })
    .andWhere(`member.is_active =:isActive`, { isActive: true })
    .skip(offset)
    .limit(limit)
    .getMany();

  if (member.length === 0) {
    throw new NotFoundException(
      `No member was found with these ${search_type}: ${dataPerson}`,
    );
  }
  return member;
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
