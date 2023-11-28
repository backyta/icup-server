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
    //* No se necesita validacion en el front hacer la interfaz que ya filtre por rol, y isActive y que muestre solo los miembros que tienen rol de copastor y que muestre todos los pastores para asignar uno.
    const { idMember, idPastor } = createCoPastorDto;

    const member: Member = await this.memberRepository.findOneBy({
      id: idMember,
    });
    console.log(member);

    const pastor: Pastor = await this.pastorRepository.findOneBy({
      id: idPastor,
    });
    //*Problema en PASTOR CONM exceso de llamadas.
    console.log(pastor);

    try {
      const coPastorInstance = this.coPastorRepository.create({
        member: member,
        pastor: pastor,
        //* Hacer conteo con la relacion (ver si hacer en actualizacion porque no se han creado casas aun)
        count_houses: 5,
        //* Hacer conteo con la relaciond de lideres (ver si hacer en actualizacion porque no se han creado lideres aun)
        count_leaders: 10,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.coPastorRepository.save(coPastorInstance);
    } catch (error) {
      console.log(error);

      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.coPastorRepository.find({
      take: limit,
      skip: offset,
      //TODO : Cargar relaciones, ejemplo, hacerlo cuando hagamols buscar sin ninguna opcion y paginemos debemos cargat toda la info
      //  relations: {
      //   images: true, //llena las imagenes, de la relacion cuando se haga el find
      // }
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
      //! AGREGAR ESTA VALIDACIONES PARA TODOS
      if (!coPastor) {
        throw new BadRequestException(`No se encontro Copastor con este UUID`);
      }
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

    //! General Exceptions
    if (!isUUID(term) && type === SearchType.id) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (term && !Object.values(SearchType).includes(type as SearchType)) {
      throw new BadRequestException(
        `Type not valid, should be: ${Object.values(SearchType).join(', ')}`,
      );
    }

    if (!coPastor) throw new NotFoundException(`Member with ${term} not found`);

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

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      member: member,
      //TODO : Contar con query con tabla copastor
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
          (coPastor) => coPastor.member.id === member.id,
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
          (coPastor) => coPastor.member.id === member.id,
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
