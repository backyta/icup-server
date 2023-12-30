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

import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';
import { Preacher } from './entities/preacher.entity';

import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { FamilyHome } from '../family-home/entities/family-home.entity';

import { SearchType } from '../common/enums/search-types.enum';
import { searchFullname, searchPerson, updateAge } from '../common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

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
    private readonly familyHomeRepository: Repository<FamilyHome>,
  ) {}

  //* CREATE PREACHER
  async create(createPreacherDto: CreatePreacherDto) {
    const { id_member, their_copastor } = createPreacherDto;

    const member = await this.memberRepository.findOneBy({
      id: id_member,
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('preacher')) {
      throw new BadRequestException(
        `The id_member must have the role of "Preacher"`,
      );
    }

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

    if (!copastor.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Creation instances
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
  async findAll(paginationDto: PaginationDto): Promise<Preacher[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.preacherRepository.find({
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Preacher | Preacher[]> {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let preacher: Preacher | Preacher[];

    //* Find ID --> One (Busca por ID, activo o inactivo)
    if (isUUID(term) && type === SearchType.id) {
      preacher = await this.preacherRepository.findOneBy({ id: term });

      if (!preacher) {
        throw new BadRequestException(`Preacher was not found with this UUID`);
      }

      //* Counting and assigning the number of members (id-preahcer member table)
      const allMembers = await this.memberRepository.find({
        relations: ['their_preacher'],
      });

      const membersOfPreacher = allMembers.filter(
        (members) => members.their_preacher?.id === term,
      );

      const listMembersID = membersOfPreacher.map(
        (copastores) => copastores.id,
      );

      //* House ID assignment according to Preacher ID
      const familyHouses = await this.familyHomeRepository.find();
      const familyHome = familyHouses.find(
        (home) => home.their_preacher.id === term,
      );

      preacher.count_members = listMembersID.length;
      preacher.members = listMembersID;

      preacher.family_home = [familyHome.id];

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
        .leftJoinAndSelect('preacher.member', 'rel1')
        .leftJoinAndSelect('preacher.their_pastor', 'rel2')
        .leftJoinAndSelect('preacher.their_copastor', 'rel3')
        .where('preacher.their_copastor =:term', { term })
        .andWhere('preacher.is_active =:isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (preacher.length === 0) {
        throw new BadRequestException(
          `No Preacher was found with this their_copastor: ${term}`,
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
          order: { created_at: 'ASC' },
        });

        if (preachers.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }
        return preachers;
      } catch (error) {
        if (error.code === '22P02') {
          throw new BadRequestException(
            `This term is not a valid boolean value`,
          );
        }

        throw error;
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

  //* UPDATE PREACHER
  async update(
    id: string,
    updatePreacherDto: UpdatePreacherDto,
  ): Promise<Preacher> {
    const { their_copastor, is_active } = updatePreacherDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    //* Member assignment and validation
    const member = await this.memberRepository.findOneBy({
      id: dataPreacher.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataPreacher.member.id}`,
      );
    }

    //* Copastor assignment and validation
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

    //* Pastor Assignment and Validation, according to the co-Pastor.
    if (!copastor.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.coPastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Actualizar el pastor y copastor de los Members con mismo preacher.
    const allMembers = await this.memberRepository.find();
    const membersByPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      if (member.their_copastor.id !== copastor.id) {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
        });
      }
    });

    //TODO : PROBAR update and delete, continuar tomorrow 31/12
    //NOTE: SI se borra en un midulo el isactive en la mayporia se pone null, es decir si se borra en pastor se setea
    //* casi todo a null, y al querer borrar el preacher(false is active) no lo encontrara porque esta null
    //* Solo deja su family home como referencia a los miembros, los demas se actualizan desde su Tabla.

    //NOTE : ver si se deja el their_family para poder identificar cuales actualizat el nuevo predicador
    //! IMPORTANTE (Revisar desde family home, el actualizar cuando se setee un nuevo pracher que tenga mismo copastor al de la zona buscar.)

    //* Bajo este contexto, las casas son independientes de copastor o preacher, por tanto cuando se cambia un preacher de copastor
    //* se puede asignar solo este nuevo preacher a la zona que tiene relacion con copastor, hacer busqueda si existe el copastor
    //* y validar. (Zone y copastor)

    //* Las casas pertenecen a ala zona, si cambio el copastor del preacher, se debe borrar de la casa familiar todos sis
    //* relaciones y asignar otro predicador que cumpla con el copastor que riga esa zona. Por ejemplo si se pasa a Pamela
    //* a copastor Mercedes, en casa familiar de Pamela se debe eliminar sus relaciones, y asignar a esta casa otro predicador
    //* que cumpla con el copastor que rige la zona.

    //* Acrualizar casa familiar si son diferentes copastores.
    const allFamilyHouses = await this.familyHomeRepository.find();
    const dataFamilyHomeByPreacher = allFamilyHouses.find(
      (home) => home.their_preacher?.id === preacher.id,
    );

    let updateFamilyHome: FamilyHome;
    if (dataFamilyHomeByPreacher.their_copastor.id !== copastor.id) {
      updateFamilyHome = await this.familyHomeRepository.preload({
        id: dataFamilyHomeByPreacher.id,
        their_preacher: null,
        their_copastor: null,
        their_pastor: null,
      });
    }

    //* Counting and assigning the number of members (id-preacher member table)
    const membersPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataMember.their_preacher?.id,
    );

    const listMembersID = membersPreacher.map((preacher) => preacher.id);

    //* House ID assignment when searching for Preacher
    const familyHouses = await this.familyHomeRepository.find();
    const familyHome = familyHouses.filter(
      (home) => home.their_preacher?.id === id,
    );

    const familyHomeId = familyHome.map((home) => home.id);

    //* Buscar Preacher-Member para eliminar their_family_home si son diferentes copastores.
    const allMemberPreacher = await this.memberRepository.find();
    const dataMemberPreacher = allMemberPreacher.find(
      (member) => member.their_preacher?.id === preacher.id,
    );

    //! Update Preacher and Member-Preacher, their_co-pastor and their_pastor.
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updatePreacherDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_family_home:
        dataMemberPreacher.their_copastor.id !== copastor.id
          ? null
          : dataMemberPreacher.their_family_home,
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
      await this.familyHomeRepository.save(updateFamilyHome);
      await Promise.all(promisesMembers);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return preacher;
  }

  //* DELETE FOR ID
  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataPreacher.member.id,
      their_copastor: null,
      their_pastor: null,
      their_family_home: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //* Update and set in false is_active on Preacher
    const preacher = await this.preacherRepository.preload({
      id: dataPreacher.id,
      their_pastor: null,
      their_copastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //* Update and set to null in Family Home
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPreacher = allFamilyHouses.filter(
      (familyHome) => familyHome.their_preacher?.id === preacher.id,
    );

    const promisesFamilyHouses = familyHousesByPreacher.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_preacher: null,
          their_pastor: null,
          their_copastor: null,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
        });
      },
    );

    //* Update and set to null in Member, all those who have the same Preacher
    const allMembers = await this.memberRepository.find();
    const membersByPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_preacher: null,
        their_pastor: null,
        their_copastor: null,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
      });
    });

    try {
      await this.memberRepository.save(member);
      await Promise.all(promisesMembers);
      await Promise.all(promisesFamilyHouses);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
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
  ): Promise<Preacher | Preacher[]> => {
    //* For find by first or last name
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
        throw new NotFoundException(
          `Not found member with role Preacher and with this name : ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const preachers = await this.preacherRepository.find();

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
          `Not found Preacher with these names ${term.slice(0, -1)}`,
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
        throw new NotFoundException(
          `Not found member with role Preacher and with these first_name & last_name: ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
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
