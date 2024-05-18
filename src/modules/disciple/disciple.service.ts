import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { MemberRoles, Status } from '@/modules/disciple/enums';
import { Disciple } from '@/modules/disciple/entities';
import { CreateDiscipleDto, UpdateDiscipleDto } from '@/modules/disciple/dto';

import { SearchType, TypeEntity, SearchTypeOfName } from '@/common/enums';
import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { updateAge, searchPeopleBy } from '@/common/helpers';

import { User } from '@/modules/user/entities';
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { FamilyHouse } from '@/modules/family-house/entities';
import { Supervisor } from '@/modules/supervisor/entities';

@Injectable()
export class DiscipleService {
  private readonly logger = new Logger('DiscipleService');

  constructor(
    @InjectRepository(Disciple)
    private readonly discipleRepository: Repository<Disciple>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly copastorRepository: Repository<Copastor>,

    @InjectRepository(Copastor)
    private readonly supervisorRepository: Repository<Supervisor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE  DISCIPLE
  async create(
    createDiscipleDto: CreateDiscipleDto,
    user: User,
  ): Promise<Disciple> {
    const { roles, theirFamilyHouseId } = createDiscipleDto;

    // Validations
    if (!roles.includes(MemberRoles.Disciple)) {
      throw new BadRequestException(`El rol "disciple" debe ser incluido`);
    }

    if (
      roles.includes(MemberRoles.Pastor) ||
      roles.includes(MemberRoles.Copastor) ||
      roles.includes(MemberRoles.Supervisor) ||
      roles.includes(MemberRoles.Preacher) ||
      roles.includes(MemberRoles.Treasurer)
    ) {
      throw new BadRequestException(
        `Para crear un Discípulo solo se debe tener el rol "discípulo"`,
      );
    }

    if (!theirFamilyHouseId) {
      throw new BadRequestException(
        `Se debe asignar una casa familiar al disciple`,
      );
    }

    // Create new instance
    if (theirFamilyHouseId && roles.includes(MemberRoles.Disciple)) {
      const familyHouse = await this.familyHouseRepository.findOneBy({
        id: theirFamilyHouseId,
      });

      if (!familyHouse) {
        throw new NotFoundException(
          `Family-Home was not found with id ${theirFamilyHouseId}`,
        );
      }

      if (!familyHouse.theirPastorId) {
        throw new NotFoundException(
          `Pastor was not found, verify that FamilyHome has a pastor assigned`,
        );
      }

      if (!familyHouse.theirCopastorId) {
        throw new NotFoundException(
          `CoPastor was not found, verify that FamilyHome has a copastor assigned`,
        );
      }

      if (!familyHouse.theirSupervisorId) {
        throw new NotFoundException(
          `Supervisor was not found, verify that FamilyHome has a supervisor assigned`,
        );
      }

      if (!familyHouse.theirPreacherId) {
        throw new NotFoundException(
          `Preacher was not found, verify that FamilyHome has a preacher assigned`,
        );
      }

      const pastor = await this.pastorRepository.findOneBy({
        id: familyHouse.theirPastorId.id,
      });

      const copastor = await this.copastorRepository.findOneBy({
        id: familyHouse.theirCopastorId.id,
      });

      const supervisor = await this.supervisorRepository.findOneBy({
        id: familyHouse.theirSupervisorId.id,
      });

      const preacher = await this.preacherRepository.findOneBy({
        id: familyHouse.theirPreacherId.id,
      });

      try {
        const newDisciple = this.discipleRepository.create({
          ...createDiscipleDto,
          theirPastorId: pastor,
          theirCopastorId: copastor,
          theirSupervisorId: supervisor,
          theirPreacherId: preacher,
          theirFamilyHouseId: familyHouse,
          createdAt: new Date(),
          createdBy: user,
        });

        await this.discipleRepository.save(newDisciple);

        return newDisciple;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Disciple[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.discipleRepository.find({
      where: { status: Status.Active },
      take: limit,
      skip: offset,
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
      order: { createdAt: 'ASC' },
    });
  }

  //* FIND BY SEARCH TERM AND TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Disciple[] | Disciple> {
    const {
      type, //search
      limit = 20,
      offset = 0,
      type_of_name, //sub_type search
    } = searchTypeAndPaginationDto;
    let member: Disciple | Disciple[];

    //* Find UUID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      member = await this.discipleRepository.findOne({
        where: { id: term },
        relations: [
          'their_copastor',
          'their_pastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      if (!member) {
        throw new NotFoundException(`Pastor was not found with this UUID`);
      }

      member.age = updateAge(member);
      await this.discipleRepository.save(member);
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

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      member = await this.findMembersWithPagination(
        SearchType.isActive,
        term,
        limit,
        offset,
      );
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      member = await this.findMembersWithPagination(
        SearchType.isActive,
        term,
        limit,
        offset,
      );
    }
    //TODO : COLOCAR created at para filtrar de mas antiguo a mas nuevo ASC DESC
    // NOTE : poner por defecto del mas nuevo al mas antiguo

    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.memberEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.discipleRepository,
      });

      return resultSearch;
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.lastName,
        limit,
        offset,
        type_entity: TypeEntity.memberEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.discipleRepository,
      });

      return resultSearch;
    }

    //* Find fullName --> Many
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.fullName,
        limit,
        offset,
        type_entity: TypeEntity.memberEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.discipleRepository,
      });

      return resultSearch;
    }

    //* Find roles --> Many
    if (term && type === SearchType.roles) {
      const rolesArray = term.split('-');

      member = await this.discipleRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.roles @> ARRAY[:...roles]::text[]', {
          roles: rolesArray,
        })
        .andWhere(`member.is_active =:isActive`, { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new NotFoundException(
          `Not found members with these roles: ${rolesArray}`,
        );
      }
    }

    //NOTE: no seria necesario porque ya se esta buscando por nombres de copastor, predicador, etc
    //* Find Members for their_copastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      member = await this.discipleRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_copastor =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new NotFoundException(
          `No Members found with this their_copastor: ${term} `,
        );
      }
    }

    //* Find Members for their_preacher --> Many
    if (isUUID(term) && type === SearchType.their_preacher) {
      member = await this.discipleRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_preacher =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new NotFoundException(
          `No Members found with this their_preacher : ${term} `,
        );
      }
    }

    //* Find Members for their_FamilyHome --> Many
    if (isUUID(term) && type === SearchType.their_family_home) {
      member = await this.discipleRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_family_home =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new NotFoundException(
          `No members found with this your_family_home : ${term} `,
        );
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

    if (
      term &&
      (type === SearchType.firstName ||
        type === SearchType.lastName ||
        type === SearchType.fullName)
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (
      type_of_name &&
      type_of_name !== SearchTypeOfName.memberCopastor &&
      type_of_name !== SearchTypeOfName.memberPastor &&
      type_of_name !== SearchTypeOfName.memberMember &&
      type_of_name !== SearchTypeOfName.memberPreacher
    ) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.memberPreacher} or ${SearchTypeOfName.memberMember} or ${SearchTypeOfName.memberPastor} or ${SearchTypeOfName.memberCopastor}`,
      );
    }

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

  //* UPDATE FOR ID
  async update(
    id: string,
    updateDiscipleDto: UpdateDiscipleDto,
    user: User,
  ): Promise<Disciple> {
    const { roles, theirSupervisorId, theirFamilyHouseId, status } =
      updateDiscipleDto;

    // Validations
    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the disciple`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const disciple = await this.discipleRepository.findOne({
      where: { id: id },
      relations: [
        'their_pastor',
        'their_copastor',
        'their_supervisor',
        'their_preacher',
        'their_family_home',
      ],
    });

    if (!disciple) {
      throw new NotFoundException(`Disciple not found with id: ${id}`);
    }

    if (!roles.includes(MemberRoles.Disciple)) {
      throw new BadRequestException(
        `The "disciple" role should always be included in the roles`,
      );
    }

    if (!roles.some((role) => ['disciple', 'preacher'].includes(role))) {
      throw new BadRequestException(
        `The roles should include "disciple" or "preacher"`,
      );
    }

    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Pastor) &&
      (roles.includes(MemberRoles.Supervisor) ||
        roles.includes(MemberRoles.Copastor) ||
        roles.includes(MemberRoles.Pastor))
    ) {
      throw new BadRequestException(
        `A higher role cannot be assigned without going through the hierarchy: [preacher, supervisor, co-pastor, pastor]`,
      );
    }

    //* Update info about Disciple
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      !disciple.roles.includes(MemberRoles.Pastor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Treasurer) &&
      roles.includes(MemberRoles.Disciple) &&
      !roles.includes(MemberRoles.Pastor) &&
      !roles.includes(MemberRoles.Copastor) &&
      !roles.includes(MemberRoles.Supervisor) &&
      !roles.includes(MemberRoles.Preacher) &&
      !roles.includes(MemberRoles.Treasurer)
    ) {
      // Validations
      if (disciple.status === Status.Active && status === Status.Inactive) {
        throw new BadRequestException(
          `You cannot update it to "inactive", you must delete the record`,
        );
      }
      if (disciple.theirFamilyHouseId.id !== theirFamilyHouseId) {
        const theirFamilyHouse = await this.familyHouseRepository.findOneBy({
          id: theirFamilyHouseId,
        });

        if (!theirFamilyHouse) {
          throw new NotFoundException(
            `Family Home was not found, with the id ${theirFamilyHouseId}`,
          );
        }

        if (!theirFamilyHouse.theirPreacherId) {
          throw new NotFoundException(
            `Preacher was not found, verify that Family Home has a preacher assigned`,
          );
        }

        if (!theirFamilyHouse.theirCopastorId) {
          throw new NotFoundException(
            `Copastor was not found, verify that Family Home has a copastor assigned`,
          );
        }

        if (!theirFamilyHouse.theirPastorId) {
          throw new NotFoundException(
            `Pastor was not found, verify that Family Home has a co-pastor assigned`,
          );
        }

        const theirPastor = await this.pastorRepository.findOneBy({
          id: theirFamilyHouse.theirPastorId.id,
        });

        const theirCopastor = await this.copastorRepository.findOneBy({
          id: theirFamilyHouse.theirCopastorId.id,
        });

        const theirSupervisor = await this.supervisorRepository.findOneBy({
          id: theirFamilyHouse.theirSupervisorId.id,
        });

        const theirPreacher = await this.preacherRepository.findOneBy({
          id: theirFamilyHouse.theirPreacherId.id,
        });

        // Update and save
        const updatedDisciple = await this.discipleRepository.preload({
          id: disciple.id,
          ...updateDiscipleDto,
          theirPastorId: theirPastor,
          theirCopastorId: theirCopastor,
          theirSupervisorId: theirSupervisor,
          theirPreacherId: theirPreacher,
          theirFamilyHouseId: theirFamilyHouse,
          updatedAt: new Date(),
          updatedBy: user,
          status: status,
        });

        try {
          return await this.discipleRepository.save(updatedDisciple);
        } catch (error) {
          this.handleDBExceptions(error);
        }
      }

      // Update and save if is same Their Family House
      const updatedDisciple = await this.discipleRepository.preload({
        id: disciple.id,
        ...updateDiscipleDto,
        theirPastorId: disciple.theirPastorId,
        theirCopastorId: disciple.theirCopastorId,
        theirSupervisorId: disciple.theirSupervisorId,
        theirPreacherId: disciple.theirPreacherId,
        theirFamilyHouseId: disciple.theirFamilyHouseId,
        updatedAt: new Date(),
        updatedBy: user,
        status: status,
      });

      try {
        return await this.discipleRepository.save(updatedDisciple);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //* Raise Disciple level to Preacher
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Treasurer) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Pastor) &&
      roles.includes(MemberRoles.Disciple) &&
      roles.includes(MemberRoles.Preacher) &&
      !roles.includes(MemberRoles.Treasurer) &&
      !roles.includes(MemberRoles.Supervisor) &&
      !roles.includes(MemberRoles.Copastor) &&
      !roles.includes(MemberRoles.Pastor) &&
      status === Status.Active
    ) {
      const theirSupervisor = await this.supervisorRepository.findOneBy({
        id: theirSupervisorId,
      });

      if (!theirSupervisor) {
        throw new NotFoundException(
          `Supervisor was not found with the ID ${theirSupervisor.id}`,
        );
      }

      if (!theirSupervisor.theirPastorId) {
        throw new NotFoundException(
          `Pastor was not found, verify that Supervisor has a co-pastor assigned`,
        );
      }

      if (!theirSupervisor.theirCopastorId) {
        throw new NotFoundException(
          `Copastor was not found, verify that Supervisor has a copastor assigned`,
        );
      }

      const theirPastor = await this.pastorRepository.findOneBy({
        id: theirSupervisor.theirPastorId.id,
      });

      const theirCopastor = await this.copastorRepository.findOneBy({
        id: theirSupervisor.theirCopastorId.id,
      });

      const theirPreacher = null;
      const theirFamilyHome = null;

      // Update and save
      const updatedDisciple = await this.discipleRepository.preload({
        id: disciple.id,
        ...updateDiscipleDto,
        theirPastorId: theirPastor,
        theirCopastorId: theirCopastor,
        theirSupervisorId: theirSupervisor,
        theirPreacherId: theirPreacher,
        theirFamilyHouseId: theirFamilyHome,
        updatedAt: new Date(),
        updatedBy: user,
      });

      try {
        const savedDisciple =
          await this.discipleRepository.save(updatedDisciple);

        const newPreacher = this.preacherRepository.create({
          //id: disciple.id, // esto no va creo
          discipleId: savedDisciple,
          theirPastorId: theirPastor,
          theirCopastorId: theirCopastor,
          theirSupervisorId: theirSupervisor,
          createdAt: new Date(),
          createdBy: user,
        });

        await this.preacherRepository.save(newPreacher);
        return savedDisciple;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      throw new BadRequestException(
        `You cannot level up, you must have the "Active" status and "theirSupervisor" must exist`,
      );
    }
  }

  //! DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    // Validations
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const disciple = await this.discipleRepository.findOneBy({ id: id });

    if (!disciple) {
      throw new BadRequestException(`Disciple with id ${id} not exist`);
    }

    // Delete all disciple relations.
    const updatedDisciple = await this.discipleRepository.preload({
      id: disciple.id,
      theirPastorId: null,
      theirCopastorId: null,
      theirSupervisorId: null,
      theirFamilyHouseId: null,
      updatedAt: new Date(),
      updatedBy: user,
      status: Status.Inactive,
    });

    //* Delete by Roles
    //? If is Pastor (set inactive and delete relation with other modules)
    if (
      disciple.roles.includes(MemberRoles.Pastor) &&
      disciple.roles.includes(MemberRoles.Disciple)
    ) {
      const allPastors = await this.pastorRepository.find();

      const pastorByDisciple = allPastors.find(
        (pastor) => pastor.discipleId.id === disciple.id,
      );

      if (!pastorByDisciple) {
        throw new NotFoundException(`Not found pastor`);
      }

      //* Update and set status inactive in Pastor
      const pastor = await this.pastorRepository.preload({
        id: pastorByDisciple.id,
        updatedAt: new Date(),
        updatedBy: user,
        status: Status.Inactive,
      });

      // Update and set to null relationships in Copastor
      const allCopastors = await this.copastorRepository.find();
      const copastorsByPastor = allCopastors.filter(
        (copastor) => copastor.theirPastorId?.id === pastorByDisciple.id,
      );

      const promisesCopastor = copastorsByPastor.map(async (copastor) => {
        await this.copastorRepository.update(copastor.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null relationships in Supervisor
      const allSupervisors = await this.preacherRepository.find();
      const supervisorsByPastor = allSupervisors.filter(
        (preacher) => preacher.theirPastorId?.id === pastorByDisciple.id,
      );

      const promisesSupervisor = supervisorsByPastor.map(async (supervisor) => {
        await this.supervisorRepository.update(supervisor.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null relationships in Zone
      const allZones = await this.supervisorRepository.find();
      const zonesByPastor = allZones.filter(
        (supervisor) => supervisor.theirPastorId?.id === pastor.id,
      );

      const promisesZone = zonesByPastor.map(async (supervisor) => {
        await this.supervisorRepository.update(supervisor.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByPastor = allPreachers.filter(
        (preacher) => preacher.theirPastorId?.id === pastorByDisciple.id,
      );

      const promisesPreacher = preachersByPastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null relationships in Family Home
      const allFamilyHouses = await this.familyHouseRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.theirPastorId?.id === pastorByDisciple.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHouseRepository.update(familyHome.id, {
            theirPastorId: null,
            updatedAt: new Date(),
            updatedBy: user,
          });
        },
      );

      // Update and set to null in Disciple, all those who have the same Pastor
      const allDisciples = await this.discipleRepository.find({
        relations: ['their_pastor'],
      });

      const disciplesByPastor = allDisciples.filter(
        (disciple) => disciple.theirPastorId?.id === pastorByDisciple.id,
      );

      const promisesDisciples = disciplesByPastor.map(async (disciple) => {
        await this.discipleRepository.update(disciple.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Save changes
      try {
        await this.discipleRepository.save(updatedDisciple);
        await this.pastorRepository.save(pastor);
        await Promise.all(promisesDisciples);
        await Promise.all(promisesCopastor);
        await Promise.all(promisesSupervisor);
        await Promise.all(promisesZone);
        await Promise.all(promisesPreacher);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? If is Copastor (set inactive and delete relation with other modules)
    if (
      disciple.roles.includes(MemberRoles.Copastor) &&
      disciple.roles.includes(MemberRoles.Disciple)
    ) {
      const allCopastors = await this.copastorRepository.find();

      const copastorByDisciple = allCopastors.find(
        (copastor) => copastor.discipleId.id === disciple.id,
      );

      if (!copastorByDisciple) {
        throw new NotFoundException(`Not found copastor`);
      }

      //* Update and set status inactive in Copastor
      const copastor = await this.copastorRepository.preload({
        id: copastorByDisciple.id,
        updatedAt: new Date(),
        updatedBy: user,
        theirPastorId: null,
        status: Status.Inactive,
      });

      // Update and set to null relationships in Supervisor
      const allSupervisors = await this.preacherRepository.find();
      const supervisorsByCopastor = allSupervisors.filter(
        (supervisor) =>
          supervisor.theirCopastorId?.id === copastorByDisciple.id,
      );

      const promisesSupervisor = supervisorsByCopastor.map(
        async (supervisor) => {
          await this.supervisorRepository.update(supervisor.id, {
            theirCopastorId: null,
            updatedAt: new Date(),
            updatedBy: user,
          });
        },
      );

      // Update and set to null relationships in Zone
      const allZones = await this.supervisorRepository.find();
      const zonesByPastor = allZones.filter(
        (supervisor) => supervisor.theirPastorId?.id === copastorByDisciple.id,
      );

      const promisesZone = zonesByPastor.map(async (supervisor) => {
        await this.supervisorRepository.update(supervisor.id, {
          theirCopastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByCopastor = allPreachers.filter(
        (preacher) => preacher.theirCopastorId?.id === copastorByDisciple.id,
      );

      const promisesPreacher = preachersByCopastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          theirCopastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null in Family Home
      const allFamilyHouses = await this.familyHouseRepository.find();
      const familyHousesByCopastor = allFamilyHouses.filter(
        (familyHome) =>
          familyHome.theirCopastorId?.id === copastorByDisciple.id,
      );

      const promisesFamilyHouses = familyHousesByCopastor.map(
        async (familyHome) => {
          await this.familyHouseRepository.update(familyHome.id, {
            theirCopastorId: null,
            updatedAt: new Date(),
            updatedBy: user,
          });
        },
      );

      // Update and set to null in Disciple, all those who have the same Copastor
      const allDisciples = await this.discipleRepository.find({
        relations: ['their_copastor'],
      });
      const disciplesByCopastor = allDisciples.filter(
        (disciple) => disciple.theirCopastorId?.id === copastorByDisciple.id,
      );

      const promisesDisciples = disciplesByCopastor.map(async (disciple) => {
        await this.discipleRepository.update(disciple.id, {
          theirCopastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // saved changes
      try {
        await this.discipleRepository.save(disciple);
        await this.copastorRepository.save(copastor);
        await Promise.all(promisesSupervisor);
        await Promise.all(promisesZone);
        await Promise.all(promisesPreacher);
        await Promise.all(promisesDisciples);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    // TODO : continuar aca despues dee hacer el supervisor service
    //? If is Supervisor (set inactive and delete relation with other modules)
    if (
      disciple.roles.includes(MemberRoles.Supervisor) &&
      disciple.roles.includes(MemberRoles.Disciple)
    ) {
      const allSupervisors = await this.supervisorRepository.find();

      const supervisorByDisciple = allSupervisors.find(
        (supervisor) => supervisor.discipleId.id === disciple.id,
      );

      if (!supervisorByDisciple) {
        throw new NotFoundException(`Not found supervisor`);
      }

      //* Update and set status inactive in Supervisor
      const supervisor = await this.supervisorRepository.preload({
        id: supervisorByDisciple.id,
        theirPastorId: null,
        theirCopastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
        status: Status.Inactive,
      });

      // Update and set to null relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersBySupervisor = allPreachers.filter(
        (preacher) =>
          preacher.theirSupervisorId?.id === supervisorByDisciple.id,
      );

      const promisesPreacher = preachersBySupervisor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          // theirPastorId: null,
          // theirCopastorId: null,
          theirSupervisorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // Update and set to null in Family Home
      const allFamilyHouses = await this.familyHouseRepository.find();
      const familyHousesByCopastor = allFamilyHouses.filter(
        (familyHome) =>
          familyHome.theirSupervisorId?.id === supervisorByDisciple.id,
      );

      const promisesFamilyHouses = familyHousesByCopastor.map(
        async (familyHome) => {
          await this.familyHouseRepository.update(familyHome.id, {
            // theirPastorId: null,
            // theirCopastorId: null,
            theirSupervisorId: null,
            updatedAt: new Date(),
            updatedBy: user,
          });
        },
      );

      // TODO : despues de hacer el el supervisor volver aQUI Y VER como hacer el delate de zones por super

      // Update and set to null in Disciple, all those who have the same Copastor
      const allDisciples = await this.discipleRepository.find({
        relations: ['their_supervisor'],
      });
      const disciplesBySupervisor = allDisciples.filter(
        (disciple) =>
          disciple.theirSupervisorId?.id === supervisorByDisciple.id,
      );

      const promisesDisciples = disciplesBySupervisor.map(async (disciple) => {
        await this.discipleRepository.update(disciple.id, {
          // theirPastorId: null,
          // theirCopastorId: null,
          theirSupervisorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // saved changes
      try {
        await this.discipleRepository.save(disciple);
        await this.copastorRepository.save(supervisor);
        await Promise.all(promisesPreacher);
        await Promise.all(promisesDisciples);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? If is Preacher (set inactive and delete relation with other modules)
    if (
      disciple.roles.includes(MemberRoles.Preacher) &&
      disciple.roles.includes(MemberRoles.Disciple)
    ) {
      const allPreachers = await this.preacherRepository.find();
      const preacherByDisciple = allPreachers.find(
        (preacher) => preacher.discipleId.id === disciple.id,
      );

      if (!preacherByDisciple) {
        throw new NotFoundException(`Not found preacher`);
      }

      // Update and set status inactive in Preacher
      const preacher = await this.preacherRepository.preload({
        id: preacherByDisciple.id,
        // theirPastorId: null,
        // theirCopastorId: null,
        theirSupervisorId: null,
        updatedAt: new Date(),
        updatedBy: user,
        status: Status.Inactive,
      });

      // Update and set to null relationships in Family House
      const allFamilyHouses = await this.familyHouseRepository.find();
      const familyHousesByPreacher = allFamilyHouses.filter(
        (familyHouse) =>
          familyHouse.theirPreacherId?.id === preacherByDisciple.id,
      );

      const promisesFamilyHouses = familyHousesByPreacher.map(
        async (familyHouse) => {
          await this.familyHouseRepository.update(familyHouse.id, {
            theirPastorId: null,
            theirCopastorId: null,
            theirSupervisorId: null,
            theirPreacherId: null,
            updatedAt: new Date(),
            updatedBy: user,
          });
        },
      );

      // Update and set to null in Member, all those who have the same Preacher
      const allMembers = await this.discipleRepository.find({
        relations: ['their_preacher'],
      });

      const disciplesByPreacher = allMembers.filter(
        (disciple) => disciple.theirPreacherId?.id === preacherByDisciple.id,
      );

      const promisesDisciples = disciplesByPreacher.map(async (disciple) => {
        await this.discipleRepository.update(disciple.id, {
          theirPastorId: null,
          theirCopastorId: null,
          theirSupervisorId: null,
          theirPreacherId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      });

      // save changes
      try {
        await this.discipleRepository.save(disciple);
        await this.preacherRepository.save(preacher);
        await Promise.all(promisesDisciples);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? If is Disciple (set inactive and delete relation with other modules)
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      (!disciple.roles.includes(MemberRoles.Pastor) ||
        !disciple.roles.includes(MemberRoles.Copastor) ||
        !disciple.roles.includes(MemberRoles.Supervisor) ||
        !disciple.roles.includes(MemberRoles.Preacher) ||
        !disciple.roles.includes(MemberRoles.Treasurer))
    ) {
      try {
        await this.discipleRepository.save(disciple);
      } catch (error) {
        this.handleDBExceptions(error);
      }
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

  //todo : poner esto de manera global en helpers, para usar y buscar por general marital is_active, etc en los demas pastor, copastor, preacgers. Buscar directo al modu
  private async findMembersWithPagination(
    searchType: string,
    term: string,
    limit: number,
    offset: number,
  ): Promise<Disciple[]> {
    const whereCondition = {};
    if (searchType === 'is_active') {
      try {
        whereCondition[searchType] = term;

        const members = await this.discipleRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          relations: [
            'their_pastor',
            'their_copastor',
            'their_preacher',
            'their_family_home',
          ],
          order: { createdAt: 'ASC' },
        });

        if (members.length === 0) {
          throw new NotFoundException(
            `Not found Members with this term: ${term}`,
          );
        }

        return members;
      } catch (error) {
        if (error.code === '22P02') {
          throw new BadRequestException(
            `This term is not a valid boolean value`,
          );
        }

        throw error;
      }
    }

    whereCondition[searchType] = term;
    whereCondition['is_active'] = true;

    const members = await this.discipleRepository.find({
      where: [whereCondition],
      take: limit,
      skip: offset,
      relations: [
        'their_pastor',
        'their_copastor',
        'their_preacher',
        'their_family_home',
      ],
      order: { createdAt: 'ASC' },
    });

    if (members.length === 0) {
      throw new NotFoundException(`Not found member with these names: ${term}`);
    }
    return members;
  }

  //! DELETE FOR SEED
  async deleteAllMembers() {
    const query = this.discipleRepository.createQueryBuilder('members');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
