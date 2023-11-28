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

import { Pastor } from './entities/pastor.entity';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';

import { Member } from '../members/entities/member.entity';

import { SearchType } from '../common/enums/search-types.enum';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { searchPerson, updateAge, searchFullname } from '../common/helpers';
import { CoPastor } from 'src/copastor/entities/copastor.entity';

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    //! Aqui hay depenedncia ciclica
    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,
  ) {}

  //* CREATE PASTOR
  async create(createPastorDto: CreatePastorDto): Promise<any> {
    const { idMember, idCopastores = [] } = createPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: idMember,
    });

    const copastoresId: CoPastor[] = await Promise.all(
      idCopastores.map(async (copastorId: string) => {
        return await this.coPastorRepository.findOneBy({
          id: copastorId,
        });
      }),
    );
    //* ya funciono el grabar por array de copastores en pastor, pero no se muestra en la relacion
    //* pero cuando se colsulta con el eager, su se muestra ahi se hace el conteo.
    //! OJO el registro de pastor no se peude borrar porque esta amarrado al Copastor, se debe eliminar
    //! Primero el copastor.

    //TODO : 29/11 hacer la validacion de is_acvite en true para las 3 entidades
    //TODO : 29/11 hacer la validacion de UUID en toda las entidades si existe (ver copastor)
    //TODO : hacer la actuliazacion de pastor y ver si al agregar copastores al array, se genera la dependencia.
    try {
      const pastorInstance = this.pastorRepository.create({
        member: member,
        created_at: new Date(),
        copastores: copastoresId,
        count_copastor: copastoresId ? copastoresId.length : 0,
        //NOTE : cambiar por id de usuario
        created_by: 'Kevin',
      });
      return await this.pastorRepository.save(pastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pastorRepository.find({
      take: limit,
      skip: offset,
      //NOTE : agregar relations para cargarlas al buscar por todas
      // relations: {
      //   member: true,
      //   copastor: true,
      // },
    });
  }

  //* FIND POR TERMINO Y TIPO DE BUSQUEDA (FILTRO)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let pastor: Pastor | Pastor[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      // NOTE: buscar solo por ID y cargar las demas relaciones para que al consultar eager toda la data.
      pastor = await this.pastorRepository.findOneBy({ id: term });
      pastor.member.age = updateAge(pastor.member);
      await this.pastorRepository.save(pastor);
    }

    //TODO : hacer que todas las consultas tengan el is_active : true
    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchPastorBy(
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
      const resultSearch = await this.searchPastorBy(
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
      const resultSearch = await this.searchPastorBy(
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

    if (!pastor) throw new NotFoundException(`Member with ${term} not found`);

    return pastor;
  }

  //* UPDATE FOR ID
  async update(id: string, updatePastorDto: UpdatePastorDto) {
    const { idCopastores } = updatePastorDto;

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor not found with id: ${dataPastor.id}`);
    }

    if (!dataPastor.member.id)
      throw new NotFoundException(
        `Member with id: ${dataPastor.member.id} not found`,
      );

    if (!dataPastor.member.roles.includes('pastor')) {
      throw new BadRequestException(
        `This member cannot be assigned as Pastor, his role must contain: ["pastor"]`,
      );
    }

    //TODO : ver si el Conteo de copastores se puede hacer con @BeforeEach (Probar)
    const member = await this.memberRepository.preload({
      id: dataPastor.member.id,
      updated_at: new Date(),
      // NOTE: cambiar por uuid en relacion con User
      updated_by: 'Kevinxd',
      ...updatePastorDto,
    });

    //NOTE : la seleccion de copastores disponibles, se hara desde una consulta en la tabla CoPastor. (Ver notion)
    const pastor = await this.pastorRepository.preload({
      id: id,
      member: member,
      //copastor: null,
      count_copastor: idCopastores ? idCopastores.length : 0,
      updated_at: new Date(),
      //NOTE : cambiar por id de usuario
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.pastorRepository.save(pastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return pastor;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    //TODO : pensar en que si se equivocan , si quieren eliminar por completo o marcar como inactivo
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataPastor.member.id,
      is_active: false,
    });

    const pastor = await this.pastorRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await this.memberRepository.save(member);
      await this.pastorRepository.save(pastor);
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

  private searchPastorBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    repository: Repository<Member>,
  ): Promise<Pastor | Pastor[]> => {
    //* Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const pastorMembers = members.filter((member) =>
        member.roles.includes('pastor'),
      );

      if (pastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const pastores = await this.pastorRepository.find();

      const newPastorMembers = pastorMembers.map((member) => {
        const newPastores = pastores.filter(
          (pastor) => pastor.member.id === member.id,
        );
        return newPastores;
      });

      const ArrayPastorMembersFlattened = newPastorMembers.flat();

      if (ArrayPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayPastorMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const pastorMembers = members.filter((member) =>
        member.roles.includes('pastor'),
      );

      if (pastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const pastores = await this.pastorRepository.find();

      const newPastorMembers = pastorMembers.map((member) => {
        const newPastores = pastores.filter(
          (pastor) => pastor.member.id === member.id,
        );
        return newPastores;
      });

      const ArrayPastorMembersFlattened = newPastorMembers.flat();

      if (ArrayPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPastorMembersFlattened;
    }
  };
}
