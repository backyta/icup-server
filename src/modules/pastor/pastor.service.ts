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

import { updateAge, searchPeopleBy } from '@/common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { SearchType, TypeEntity, SearchTypeOfName } from '@/common/enums';

import { MemberRoles, Status } from '@/modules/disciple/enums';

import { Pastor } from '@/modules/pastor/entities';
import { CreatePastorDto, UpdatePastorDto } from '@/modules/pastor/dto';

import { User } from '@/modules/user/entities';
import { Disciple } from '@/modules/disciple/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Supervisor } from '@/modules/supervisor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { FamilyHouse } from '@/modules/family-house/entities';
import { Zone } from '@/modules/zone/entities';

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Disciple)
    private readonly discipleRepository: Repository<Disciple>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly copastorRepository: Repository<Copastor>,

    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,

    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  //* CREATE PASTOR
  async create(createPastorDto: CreatePastorDto, user: User): Promise<Pastor> {
    const { roles } = createPastorDto;

    // Validations
    if (
      !roles.includes(MemberRoles.Disciple) &&
      !roles.includes(MemberRoles.Pastor)
    ) {
      throw new BadRequestException(
        `El rol "disciple" y "pastor" debe ser incluido`,
      );
    }

    if (
      roles.includes(MemberRoles.Copastor) ||
      roles.includes(MemberRoles.Supervisor) ||
      roles.includes(MemberRoles.Preacher) ||
      roles.includes(MemberRoles.Treasurer)
    ) {
      throw new BadRequestException(
        `Para crear un Pastor solo se debe tener los roles "discípulo" y "pastor"`,
      );
    }

    // Create new instance
    if (
      roles.includes(MemberRoles.Pastor) &&
      roles.includes(MemberRoles.Disciple)
    ) {
      try {
        const newDisciple = this.discipleRepository.create({
          ...createPastorDto,
          createdBy: user,
          createdAt: new Date(),
        });

        await this.discipleRepository.save(newDisciple);

        const newPastor = this.pastorRepository.create({
          discipleId: newDisciple,
          createdAt: new Date(),
          createdBy: user,
        });

        await this.pastorRepository.save(newPastor);

        return newPastor;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Pastor[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.pastorRepository.find({
      where: { status: Status.Inactive },
      take: limit,
      skip: offset,
      order: { createdAt: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Pastor | Pastor[]> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let pastor: Pastor | Pastor[];

    //* Find ID --> One (active or inactive)
    if (isUUID(term) && type === SearchType.id) {
      pastor = await this.pastorRepository.findOne({
        where: { id: term },
      });

      if (!pastor) {
        throw new NotFoundException(`Pastor was not found with this UUID`);
      }

      //* Count and assignment of co-pastors
      const allCopastores = await this.copastorRepository.find();
      const listCopastores = allCopastores.filter(
        (copastor) => copastor.theirPastorId?.id === term && copastor.status,
      );

      const listCopastoresID = listCopastores.map(
        (copastores) => copastores.id,
      );

      //* Count and assignment of preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.theirPastorId?.id === term && preacher.status,
      );

      const listPreachersID = listPreachers.map((copastores) => copastores.id);

      pastor.numberCopastors = listCopastores.length;
      pastor.copastorsId = listCopastoresID;

      pastor.preachersId = listPreachersID;
      pastor.numberPreachers = listPreachers.length;

      //* Update age, when querying by ID
      pastor.discipleId.age = updateAge(pastor.discipleId);

      await this.pastorRepository.save(pastor);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.pastorRepository,
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
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.pastorRepository,
      });

      return resultSearch;
    }

    //* Find fullName --> One
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.fullName,
        limit,
        offset,
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.pastorRepository,
      });

      return resultSearch;
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const pastores = await this.pastorRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { createdAt: 'ASC' },
        });

        if (pastores.length === 0) {
          throw new NotFoundException(
            `Not found Pastores with this term: ${term}`,
          );
        }

        return pastores;
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

    if (
      term &&
      (SearchType.firstName || SearchType.lastName || SearchType.fullName)
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (type_of_name && type_of_name !== SearchTypeOfName.pastorMember) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.pastorMember}`,
      );
    }

    if (!pastor) throw new NotFoundException(`Pastor with ${term} not found`);

    return pastor;
  }

  //* UPDATE FOR ID
  async update(
    id: string,
    updatePastorDto: UpdatePastorDto,
    user: User,
  ): Promise<Pastor> {
    const { roles, status } = updatePastorDto;

    // Validations
    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the pastor`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const pastor = await this.pastorRepository.findOneBy({ id });

    if (!pastor) {
      throw new NotFoundException(`Pastor not found with id: ${id}`);
    }

    const disciple = await this.discipleRepository.findOne({
      where: { id: pastor.discipleId.id },
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

    if (!roles.some((role) => ['disciple', 'pastor'].includes(role))) {
      throw new BadRequestException(
        `The roles should include "disciple" and "preacher"`,
      );
    }

    if (
      disciple.roles.includes(MemberRoles.Pastor) &&
      disciple.roles.includes(MemberRoles.Disciple) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      (roles.includes(MemberRoles.Supervisor) ||
        roles.includes(MemberRoles.Copastor) ||
        roles.includes(MemberRoles.Preacher) ||
        roles.includes(MemberRoles.Treasurer))
    ) {
      throw new BadRequestException(
        `A lower role cannot be assigned without going through the hierarchy: [preacher, supervisor, co-pastor, pastor]`,
      );
    }

    //* Update info about Pastor
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      disciple.roles.includes(MemberRoles.Pastor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Treasurer) &&
      roles.includes(MemberRoles.Disciple) &&
      roles.includes(MemberRoles.Pastor) &&
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

      if (pastor.status === Status.Active && status === Status.Inactive) {
        throw new BadRequestException(
          `You cannot update it to "inactive", you must delete the record`,
        );
      }

      // Calculate number of copastors  by pastor and assign Ids
      const allCopastores = await this.copastorRepository.find();
      const listCopastores = allCopastores.filter(
        (copastor) => copastor.theirPastorId?.id === pastor.id,
      );

      const listCopastorsId = listCopastores.map((copastors) => copastors.id);

      // Calculate number of supervisors by pastor and assign Ids
      const allSupervisors = await this.supervisorRepository.find();
      const listSupervisors = allSupervisors.filter(
        (supervisor) => supervisor.theirPastorId?.id === pastor.id,
      );

      const listSupervisorsId = listSupervisors.map(
        (supervisor) => supervisor.id,
      );

      // Calculate number of preachers by pastor and assign Ids
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.theirPastorId?.id === pastor.id,
      );

      const listPreachersId = listPreachers.map((preacher) => preacher.id);

      // Calculate number of Zones  by pastor and assign Ids
      const allZones = await this.zoneRepository.find();
      const listZones = allZones.filter(
        (zone) => zone.theirPastorId?.id === pastor.id,
      );

      const listZonesId = listZones.map((preacher) => preacher.id);

      // Calculate number of Family Houses by pastor and assign Ids
      const allFamilyHouses = await this.familyHouseRepository.find();
      const listFamilyHouses = allFamilyHouses.filter(
        (familyHouse) => familyHouse.theirPastorId?.id === pastor.id,
      );

      const listFamilyHousesId = listFamilyHouses.map(
        (familyHouse) => familyHouse.id,
      );

      // Calculate number of Disciples by pastor and assign Ids
      const allDisciples = await this.familyHouseRepository.find();
      const listDisciples = allDisciples.filter(
        (familyHouse) => familyHouse.theirPastorId?.id === pastor.id,
      );

      const listDisciplesId = listDisciples.map((disciple) => disciple.id);

      // Update and save
      const updatedDisciple = await this.discipleRepository.preload({
        id: disciple.id,
        ...updatePastorDto,
        updatedAt: new Date(),
        updatedBy: user,
        status: status,
      });

      const updatedPastor = await this.pastorRepository.preload({
        id: pastor.id,
        discipleId: updatedDisciple,
        copastorsId: listCopastorsId,
        numberCopastors: listCopastores.length,
        supervisorsId: listSupervisorsId,
        numberSupervisors: listSupervisors.length,
        preachersId: listPreachersId,
        numberPreachers: listPreachers.length,
        zonesId: listZonesId,
        numberZones: listZones.length,
        familyHousesId: listFamilyHousesId,
        numberFamilyHouses: listFamilyHouses.length,
        disciplesId: listDisciplesId,
        numberDisciples: listDisciples.length,
        updatedAt: new Date(),
        updatedBy: user,
        status: status,
      });

      try {
        await this.discipleRepository.save(updatedDisciple);
        return await this.pastorRepository.save(updatedPastor);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //! DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    // Validations
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const pastor = await this.pastorRepository.findOneBy({ id });

    if (!pastor) {
      throw new NotFoundException(`Pastor with id: ${id} not exits`);
    }

    //* Update and set in "Inactive" on Disciple
    const updatedDisciple = await this.discipleRepository.preload({
      id: pastor.discipleId.id,
      theirPastorId: null,
      theirCopastorId: null,
      theirSupervisorId: null,
      theirFamilyHouseId: null,
      updatedAt: new Date(),
      updatedBy: user,
      status: Status.Inactive,
    });

    //* Update and set in Inactive on Pastor
    const updatedPastor = await this.pastorRepository.preload({
      id: pastor.id,
      updatedAt: new Date(),
      updatedBy: user,
      status: Status.Inactive,
    });

    // Update and set to null relationships in Copastor (who have same Pastor)
    const allCopastores = await this.copastorRepository.find();
    const copastoresByPastor = allCopastores.filter(
      (copastor) => copastor.theirPastorId?.id === pastor.id,
    );

    const promisesCopastor = copastoresByPastor.map(async (copastor) => {
      await this.copastorRepository.update(copastor.id, {
        theirPastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Supervisor (who have same Pastor)
    const allSupervisors = await this.supervisorRepository.find();
    const supervisorsByPastor = allSupervisors.filter(
      (supervisor) => supervisor.theirPastorId?.id === pastor.id,
    );

    const promisesSupervisor = supervisorsByPastor.map(async (supervisor) => {
      await this.supervisorRepository.update(supervisor.id, {
        theirPastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Zones (who have same Pastor)
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

    // Update and set to null relationships in Preacher (who have same Pastor)
    const allPreachers = await this.preacherRepository.find();
    const preachersByPastor = allPreachers.filter(
      (preacher) => preacher.theirPastorId?.id === pastor.id,
    );

    const promisesPreacher = preachersByPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        theirPastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Family House (who have same Pastor)
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.theirPastorId?.id === pastor.id,
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

    // Update and set to null relationships in Disciple, all those who have the same Pastor.
    const allDisciples = await this.discipleRepository.find({
      relations: ['their_pastor'],
    });

    const disciplesByPastor = allDisciples.filter(
      (disciple) => disciple.theirPastorId?.id === pastor.id,
    );

    const promisesDisciples = disciplesByPastor.map(async (disciple) => {
      await this.discipleRepository.update(disciple.id, {
        theirPastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and save
    try {
      await this.discipleRepository.save(updatedDisciple);
      await this.pastorRepository.save(updatedPastor);
      await Promise.all(promisesDisciples);
      await Promise.all(promisesCopastor);
      await Promise.all(promisesZone);
      await Promise.all(promisesSupervisor);
      await Promise.all(promisesPreacher);
      await Promise.all(promisesFamilyHouses);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }
}
