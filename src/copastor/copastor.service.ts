import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { CreateCoPastorDto } from './dto/create-copastor.dto';
import { UpdateCoPastorDto } from './dto/update-copastor.dto';
import { Pastor } from '../pastor/entities/pastor.entity';
import { Member } from '../members/entities/member.entity';

import { CoPastor } from './entities/copastor.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { updateAge, searchPerson, searchFullname } from '../common/helpers';
import { SearchType } from '../common/enums/search-types.enum';

//TODO : crear las demas tablas, para ir avanzando, y modificar las propiedades de la Entidad, their_pastor.
@Injectable()
export class CoPastorService {
  private readonly logger = new Logger('CoPastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,
  ) {}

  //* CREATE COPASTOR
  async create(createCoPastorDto: CreateCoPastorDto) {
    const { id_member, id_pastor } = createCoPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: id_member,
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Pastor"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: id_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Not faound Pastor with id ${id_member}`);
    }
    // ! Aqui no mandar todo en undefined las cas y lederes y en buscar ahi se actualiza
    //TODO : Hacer las mismas consultas de pastor, para setear aqui el array lideres y residencias y luego hacer el count
    try {
      const coPastorInstance = this.coPastorRepository.create({
        member: member,
        pastor: pastor,
        count_houses: 5,
        count_leaders: 10,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.coPastorRepository.save(coPastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.coPastorRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let coPastor: CoPastor | CoPastor[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.coPastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new BadRequestException(`No se encontro Copastor con este UUID`);
      }

      if (!coPastor.is_active) {
        throw new BadRequestException(`CoPastor should is active`);
      }

      //TODO : hacer aqui las mismas consultas para generar el array y el conteo

      coPastor.member.age = updateAge(coPastor.member);
      await this.coPastorRepository.save(coPastor);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find fullName --> One
    if (term && type === SearchType.fullName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const coPastores = await this.coPastorRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
        });

        if (coPastores.length === 0) {
          throw new NotFoundException(
            `Not found member with these names: ${term}`,
          );
        }
        return coPastores;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
      }
    }

    //! General Exceptions
    if (!isUUID(term) && type === SearchType.id) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (term && !Object.values(SearchType).includes(type as SearchType)) {
      throw new BadRequestException(
        `Type not valid, should be: ${Object.values(SearchType).join(', ')}`,
      );
    }

    if (!coPastor)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return coPastor;
  }

  //* UPDATE FOR ID
  async update(id: string, updateCoPastorDto: UpdateCoPastorDto) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(
        `CoPastor not found with id: ${dataCoPastor.id}`,
      );
    }

    if (!dataCoPastor.member.id)
      throw new NotFoundException(
        `Member with id: ${dataCoPastor.member.id} not found`,
      );

    if (!dataCoPastor.member.roles.includes('pastor')) {
      throw new BadRequestException(
        `This member cannot be assigned as Pastor, his role must contain: ["pastor"]`,
      );
    }

    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      updated_at: new Date(),
      //? Colocar usuario cuando se haga auth
      updated_by: 'Kevinxd',
      ...updateCoPastorDto,
    });

    //TODO : hacer las mismas consultas para sacar el conteo y array, al actualiza se setea al igual que buscar por ID.
    const coPastor = await this.coPastorRepository.preload({
      id: id,
      member: member,
      count_houses: 16,
      count_leaders: 11,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.coPastorRepository.save(coPastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return coPastor;
  }

  //* DELETE FOR ID
  //TODO : Aplicar is active en false pero aqui ya no iria pastor, porque seria independiente.
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      is_active: false,
    });

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await this.memberRepository.save(member);
      await this.coPastorRepository.save(coPastor);
    } catch (error) {
      this.logger.error(error);
    }
  }

  //! PRIVATE METHODS
  //* Para futuros errores de indices o constrains con code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  private searchCoPastorBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    repository: Repository<Member>,
  ) => {
    //* Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const coPastorMembers = members.filter((member) =>
        member.roles.includes('copastor'),
      );

      if (coPastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'copastor'`);
      }

      const coPastores = await this.coPastorRepository.find();

      const newCoPastorMembers = coPastores.map((member) => {
        const newCoPastores = coPastores.filter(
          (coPastor) =>
            coPastor.member.id === member.id && coPastor.is_active === true,
        );
        return newCoPastores;
      });

      const ArrayCoPastorMembersFlattened = newCoPastorMembers.flat();

      if (ArrayCoPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const coPastorMembers = members.filter((member) =>
        member.roles.includes('copastor'),
      );

      if (coPastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const coPastores = await this.pastorRepository.find();

      const newCoPastorMembers = coPastorMembers.map((member) => {
        const newCoPastores = coPastores.filter(
          (coPastor) =>
            coPastor.member.id === member.id && coPastor.is_active === true,
        );
        return newCoPastores;
      });

      const ArrayCoPastorMembersFlattened = newCoPastorMembers.flat();

      if (ArrayCoPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found coPastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }
  };
}
