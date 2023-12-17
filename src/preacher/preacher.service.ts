import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { Repository } from 'typeorm';
import { Preacher } from './entities/preacher.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from 'src/common/enums/search-types.enum';
import { searchFullname, searchPerson, updateAge } from 'src/common/helpers';
import { FamilyHome } from 'src/family-home/entities/family-home.entity';

@Injectable()
export class PreacherService {
  private readonly logger = new Logger('PreacherService');

  constructor(
    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(FamilyHome)
    private readonly familyHousesRepository: Repository<FamilyHome>,
  ) {}

  //* CREATE PREACHER
  async create(createPreacherDto: CreatePreacherDto) {
    const { id_member, their_copastor } = createPreacherDto;

    //* Validation member
    const member = await this.memberRepository.findOne({
      where: { id: id_member },
      relations: ['their_copastor', 'their_pastor'],
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('preacher')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Preacher"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    //* Validation copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${their_copastor}`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Validation pastor (usamos el pastor relacionado al copastor)
    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Not faound Pastor with id ${copastor.their_pastor.id}`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Creacion de la instancia
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      their_pastor: pastor,
      their_copastor: copastor,
    });

    try {
      const preacherInstance = this.preacherRepository.create({
        member: member,
        their_pastor: pastor,
        their_copastor: copastor,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      await this.memberRepository.save(dataMember);
      return await this.preacherRepository.save(preacherInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.preacherRepository.find({
      take: limit,
      skip: offset,
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let preacher: Preacher | Preacher[];

    //* Find ID --> One (Busca por ID, activo o inactivo)
    if (isUUID(term) && type === SearchType.id) {
      preacher = await this.preacherRepository.findOneBy({ id: term });

      if (!preacher) {
        throw new BadRequestException(`No se encontro Preacher con este UUID`);
      }

      //* Conteo y asignacion de Cantidad de miembros(id-preahcer tabla member)
      const allMembers = await this.memberRepository.find();
      const membersOfPreacher = allMembers.filter(
        (members) => members.their_preacher.id === term,
      );

      const listMembersID = membersOfPreacher.map(
        (copastores) => copastores.id,
      );

      //* Asignacion de ID Casa cuando se busca por Preacher
      const familyHouses = await this.familyHousesRepository.find();
      const familyHome = familyHouses.filter(
        (home) => home.their_preacher.id === term,
      );

      const familyHomeId = familyHome.map((home) => home.id);

      //* Asignacion de Casa familiar al buscar por ID
      preacher.count_members = listMembersID.length;
      preacher.members = listMembersID;

      preacher.family_home = familyHomeId;

      //* Update age, when querying by ID
      preacher.member.age = updateAge(preacher.member);

      await this.preacherRepository.save(preacher);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchPreacherBy(
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
      const resultSearch = await this.searchPreacherBy(
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
      const resultSearch = await this.searchPreacherBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find CoPastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      preacher = await this.preacherRepository
        .createQueryBuilder('preacher')
        .where('preacher.their_copastor = :term', { term })
        .andWhere('preacher.is_active = :isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (preacher.length === 0) {
        throw new BadRequestException(
          `No se encontro ninguna Preacher con este their_copastor : ${term} `,
        );
      }
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const preachers = await this.preacherRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
        });

        if (preachers.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }
        return preachers;
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

    if (!preacher)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return preacher;
  }

  //! si un preacher se actualiza y cambia su copastor, automaticamente debe buscar su pastor relacionado a ese copastor
  //! y cambiarlo, osea is eligo otro copastor busco a su pastor relacionado y lo seteo, asi mantengo la relacion.
  //! Asi mismo si cambia su copastor, se debe actualizar en Member al registro del preacher su copastor y pastor relacionado.
  //Note: desde el frotn bloquear elegir a un pastor, pero mostrar cuando cambio de copastor el nuevo pastor que se setea.

  //* UPDATE PREACHER
  async update(id: string, updatePreacherDto: UpdatePreacherDto) {
    const { their_copastor, is_active } = updatePreacherDto;

    if (is_active === undefined) {
      throw new BadRequestException(
        `Debe asignar un valor booleano a is_Active`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    //* Asignacion y validacion de Member
    const member = await this.memberRepository.findOneBy({
      id: dataPreacher.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataPreacher.member.id}`,
      );
    }

    if (!member.roles.includes('preacher')) {
      throw new BadRequestException(
        `Cannot assign this member as Preacher, missing role: ['preacher']`,
      );
    }

    //* Asignacion y validacion de Copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_copastor}`);
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Asignacion y Validation de Pastor, segun el coPastor.
    const pastor = await this.coPastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Pastor Not found with id ${copastor.their_pastor.id}`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //NOTE : esto no seria necesario porque en busqueda por ID, se haria la actualizacion del conteo y seteo (revisar.)
    //* Conteo y asignacion de Cantidad de miembros(id-preacher tabla member)
    const allMembers = await this.memberRepository.find();
    const membersPreacher = allMembers.filter(
      (members) => members.their_preacher.id === id,
    );

    const listMembersID = membersPreacher.map((preacher) => preacher.id);

    //* Asignacion de ID Casa cuando se busca por Preacher
    const familyHouses = await this.familyHousesRepository.find();
    const familyHome = familyHouses.filter(
      (home) => home.their_preacher.id === id,
    );

    const familyHomeId = familyHome.map((home) => home.id);

    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updatePreacherDto,
      their_pastor: pastor,
      their_copastor: copastor,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    const preacher = await this.preacherRepository.preload({
      id: id,
      member: dataMember,
      their_pastor: pastor,
      their_copastor: copastor,
      members: listMembersID,
      count_members: listMembersID.length,
      family_home: familyHomeId,
      is_active: is_active,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.preacherRepository.save(preacher);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return preacher;
  }

  //* DELETE FOR ID
  //todo : trabajar aqui falta....
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataPreacher.member.id,
      is_active: false,
    });

    const preacher = await this.preacherRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await this.memberRepository.save(member);
      await this.preacherRepository.save(preacher);
    } catch (error) {
      this.handleDBExceptions(error);
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

  private searchPreacherBy = async (
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

      const preacherMembers = members.filter((member) =>
        member.roles.includes('preacher'),
      );

      if (preacherMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'preachher'`);
      }

      const preachers = await this.preacherRepository.find();

      //* retorna uno o mas elementos del array segun igualdad, por cada member del mapo tendremos un array
      //* de 1 o mas elementos [[a,b], [a]] . al final los aplanamos
      const newPreacherMembers = preacherMembers.map((member) => {
        const newPreachers = preachers.filter(
          (preacher) =>
            preacher.member.id === member.id && preacher.is_active === true,
        );
        return newPreachers;
      });

      const ArrayPreacherMembersFlattened = newPreacherMembers.flat();

      if (ArrayPreacherMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayPreacherMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const preacherMembers = members.filter((member) =>
        member.roles.includes('preacher'),
      );

      if (preacherMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Preacher'`);
      }

      const preachers = await this.preacherRepository.find();

      const newPreacherMembers = preacherMembers.map((member) => {
        const newPreacher = preachers.filter(
          (preacher) =>
            preacher.member.id === member.id && preacher.is_active === true,
        );
        return newPreacher;
      });

      const ArrayPreacherMembersFlattened = newPreacherMembers.flat();

      if (ArrayPreacherMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPreacherMembersFlattened;
    }
  };
}
