import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { ValidRoles } from './enums/valid-roles.enum';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { SearchType } from './enums/search-types.enum';
import { SearchPersonOptions } from './interfaces/search-person.interface';
import { SearchTypeAndPaginationDto } from 'src/common/dtos';

@Injectable()
export class MembersService {
  private readonly logger = new Logger('MermbersService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto) {
    const validRoles = Object.values(ValidRoles);

    createMemberDto.roles.map((rol) => {
      if (!validRoles.includes(rol as ValidRoles)) {
        throw new BadRequestException(
          `Not valid role, use the following: ${validRoles}`,
        );
      }
    });

    try {
      const member = this.memberRepository.create(createMemberDto);
      await this.memberRepository.save(member);

      return member;
    } catch (error) {
      this.logger.error(error);
      // console.log(error);
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.memberRepository.find({
      take: limit,
      skip: offset,
      //TODO : relaciones
    });
  }

  //* FIND POR TERMINO Y TIPO DE BUSQUEDA (FILTRO)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let member: Member | Member[];

    //? Para cuando haiga relaciones
    //NOTE : add busqueda por id de las "relaciones" como ID copastor o leader
    //NOTE : hacer type de Relacion (Copastor x id)
    //NOTE : manejar mayuscilas y minusculaas ver video(LIKE convierte a min todo)

    //FIXME : arreglar todos los badRequest por NotFound Exceptions
    //FIXME : hacer obligatorio el termino, todo mediante el controlar y su DTO, si no viene colocarmos un default para que al validar de error o no seria necesaro con el validator

    //* Find UUID --> One
    if (isUUID(term) && type === SearchType.id) {
      member = await this.memberRepository.findOneBy({ id: term });
    }

    //* Find gender --> Many
    if (term && type === SearchType.gender) {
      member = await this.findMembersWithPagination(
        SearchType.gender,
        term,
        limit,
        offset,
      );
    }

    //* Find maritalStatus --> Many
    if (term && type === SearchType.maritalStatus) {
      member = await this.findMembersWithPagination(
        SearchType.maritalStatus,
        term,
        limit,
        offset,
      );
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      member = await this.searchPerson({
        term,
        searchType: SearchType.firstName,
        limit,
        offset,
      });
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName) {
      member = await this.searchPerson({
        term,
        searchType: SearchType.lastName,
        limit,
        offset,
      });
    }

    //* Find fullName --> Many
    if (term && type === SearchType.fullName) {
      member = await this.searchFullname(term, limit, offset);
    }

    //* Find roles --> Many
    if (term && type === SearchType.roles) {
      const rolesArray = term.split('-');
      console.log(rolesArray);

      member = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.roles @> ARRAY[:...roles]::text[]', {
          roles: rolesArray,
        })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `Not found members with those roles: ${rolesArray}`,
        );
      }
    }
    console.log(term);

    if (!isUUID(term) && term === '' && type === SearchType.id) {
      throw new BadRequestException(`Id no viene en la pericion`);
    }

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

  //* UPDATE FOR ID Y PAYLOAD
  //TODO : trabajar en esto tomorrow 22//11
  update(id: string, updateMemberDto: UpdateMemberDto) {
    console.log(updateMemberDto);

    return `This action updates a #${id} member`;
  }

  //* ELIMINAR POR ID
  // NOTE : ajustar el metodo en futro cuando se integren relaciones.
  async remove(id: string) {
    let member: Member;

    if (isUUID(id)) {
      member = await this.memberRepository.findOneBy({ id });
    }

    if (member) {
      try {
        await this.memberRepository.remove(member); //? deberia ser como una actualizacion para marcar como inactivo
      } catch (error) {
        this.logger.error(error);
      }
    } else {
      throw new NotFoundException(`Member with id: ${id} not exits`);
    }
  }

  //! PRIVATE METHODS
  //* Para futuros errores de indices o constrains con code
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  private async searchPerson({
    term,
    searchType,
    limit,
    offset,
  }: SearchPersonOptions): Promise<Member[]> {
    let dataPerson: string;

    if (/^[^+]*\+[^+]*$/.test(term)) {
      const arrayData = term.split('+');

      if (arrayData.length >= 2 && arrayData.includes('')) {
        dataPerson = arrayData.join('');
      } else {
        dataPerson = arrayData.join(' ');
      }
    } else {
      throw new BadRequestException(`Term not valid, only use for concat '+'`);
    }

    const queryBuilder = this.memberRepository.createQueryBuilder();
    const member: Member | Member[] = await queryBuilder
      .where(`${searchType} ILIKE :searchTerm`, {
        searchTerm: `%${dataPerson}%`,
      })
      .skip(offset)
      .limit(limit)
      .getMany();

    if (member.length === 0) {
      throw new BadRequestException(
        `Not found member with those names: ${dataPerson}`,
      );
    }
    return member;
  }

  private validateName(name: string): string {
    let wordString: string;

    if (/^[^+]+(?:\+[^+]+)*\+$/.test(name)) {
      const sliceWord = name.slice(0, -1);
      wordString = sliceWord.split('+').join(' ');
    } else {
      throw new BadRequestException(
        `${name} not valid use '+' to finally string`,
      );
    }
    return wordString;
  }

  private async searchFullname(
    term: string,
    limit: number,
    offset: number,
  ): Promise<Member[]> {
    if (!term.includes('-')) {
      throw new BadRequestException(
        `Term not valid, use allow '-' for concatc firstname and lastname`,
      );
    }

    const [first, second] = term.split('-');
    const firstName = this.validateName(first);
    const lastName = this.validateName(second);

    const queryBuilder = this.memberRepository.createQueryBuilder('member');
    const member = await queryBuilder
      .where(`member.first_name ILIKE :searchTerm1`, {
        searchTerm1: `%${firstName}%`,
      })
      .andWhere(`member.last_name ILIKE :searchTerm2`, {
        searchTerm2: `%${lastName}%`,
      })
      .skip(offset)
      .limit(limit)
      .getMany();

    if (member.length === 0) {
      throw new BadRequestException(
        `Not found member with those names: ${firstName} ${lastName}`,
      );
    }
    return member;
  }

  private async findMembersWithPagination(
    searchType: string,
    term: string,
    limit: number,
    offset: number,
  ): Promise<Member[]> {
    const whereCondition = {};
    whereCondition[searchType] = term;

    const member = await this.memberRepository.find({
      where: [whereCondition],
      take: limit,
      skip: offset,
    });

    if (member.length === 0) {
      throw new BadRequestException(
        `Not found member with those names: ${term}`,
      );
    }
    return member;
  }
}
