import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SearchPersonOptions } from 'src/common/interfaces/search-person.interface';
import { Member } from '../../members/entities/member.entity';

export const searchPerson = async ({
  term,
  searchType,
  limit,
  offset,
  repository,
}: SearchPersonOptions): Promise<Member[]> => {
  let dataPerson: string;

  if (/^[^+]*\+[^+]*$/.test(term)) {
    const arrayData = term.split('+');

    if (arrayData.length >= 2 && arrayData.includes('')) {
      dataPerson = arrayData.join('');
    } else {
      dataPerson = arrayData.join(' ');
    }
  } else {
    throw new BadRequestException(
      `Term not valid, only use for concat '+' to finnally, dont use -`,
    );
  }

  const queryBuilder = repository.createQueryBuilder();
  const member = await queryBuilder
    .where(`${searchType} ILIKE :searchTerm`, {
      searchTerm: `%${dataPerson}%`,
    })
    .skip(offset)
    .limit(limit)
    .getMany();

  if (member.length === 0) {
    throw new NotFoundException(
      `Not found member with those names: ${dataPerson}`,
    );
  }
  return member;
};
