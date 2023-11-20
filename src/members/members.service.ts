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
import { QueryTypeDto } from 'src/common/dtos';
import { SearchType } from './enums/search-types.enum';

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
      console.log(error);
      this.handleDBExceptions(error);
    }
  }

  //* BUSCAR TODOS (FILTRO Y PAGINADO)
  //TODO : Paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.memberRepository.find({
      take: limit,
      skip: offset,
      //TODO : relaciones
    });
  }

  //* BUSCAR POR TERMINO Y TIPO DE BUSQUEDA
  async findTerm(term: string, searchType: QueryTypeDto) {
    const { type } = searchType;
    let member: Member | Member[];

    //TODO : add busqueda por id de las relaciones como ID copastor o leader
    if (isUUID(term) && type === SearchType.id) {
      member = await this.memberRepository.findOneBy({ id: term });
    }

    if (term && type === SearchType.gender) {
      member = await this.memberRepository.findBy({ gender: term });
    }

    if (term && type === SearchType.maritalstatus) {
      member = await this.memberRepository.findBy({ maritalStatus: term });
    }

    if (term && type === SearchType.firstName) {
      member = await this.searchPerson(term, SearchType.firstName);
    }

    if (term && type === SearchType.lastName) {
      member = await this.searchPerson(term, SearchType.lastName);
    }

    if (term && type === SearchType.fullName) {
      if (!term.includes('-')) {
        throw new BadRequestException(
          `Term not valid, use allow '-' for concatc firstname and lastname`,
        );
      }

      const [first, second] = term.split('-');
      const firstName = this.validateName(first);
      const lastName = this.validateName(second);

      const queryBuilder = this.memberRepository.createQueryBuilder();
      member = await queryBuilder
        .where(`firstname ILIKE :searchTerm1`, {
          searchTerm1: `%${firstName}%`,
        })
        .andWhere(`lastname ILIKE :searchTerm2`, {
          searchTerm2: `%${lastName}%`,
        })
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `Not found member with those names: ${firstName} ${lastName}`,
        );
      }
    }

    //* AFINAR BUSQUEDA POR ROLES
    if (term && type === SearchType.roles) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .where(':role = ANY(member.roles)', { role: term })
        .getMany();
    }

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

  //TODO : hacer bsuqueda por varios roles que se pasaran separar por espacio o -
  //TODO : hacer type de Relacion (Copastor x id)
  //TODO : manejar mayuscilas y minusculaas ver video(LIKE convierte a min todo)

  //* ACTUALIZAR POR ID Y PAYLOAD
  update(id: string, updateMemberDto: UpdateMemberDto) {
    console.log(updateMemberDto);

    return `This action updates a #${id} member`;
  }

  //* ELIMINAR POR ID
  async remove(id: string) {
    // const member = await this.findOne(id);
    // await this.memberRepository.remove(member); //? deberia ser como una actualizacion para marcar como inactivo
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

  private async searchPerson(term: string, searchType: string) {
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
      .getMany();

    if (member.length === 0) {
      throw new BadRequestException(
        `Not found member with those names: ${dataPerson}`,
      );
    }
    return member;
  }

  private validateName(name: string) {
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
}
