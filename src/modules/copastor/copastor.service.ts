import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

import { updateAge, searchPeopleBy } from '@/common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { SearchType, TypeEntity, SearchTypeOfName } from '@/common/enums';

import { CreateCopastorDto, UpdateCopastorDto } from '@/modules/copastor/dto';

import { MemberRoles, Status } from '@/modules/disciple/enums';

import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Supervisor } from '@/modules/supervisor/entities';
import { Disciple } from '@/modules/disciple/entities';
import { Preacher } from '@/modules/preacher/entities';
import { FamilyHouse } from '@/modules/family-house/entities';
import { Zone } from '@/modules/zone/entities';
import { User } from '@/modules/user/entities';

@Injectable()
export class CoPastorService {
  private readonly logger = new Logger('CoPastorService');

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

  //* CREATE COPASTOR
  async create(
    createCopastorDto: CreateCopastorDto,
    user: User,
  ): Promise<Copastor> {
    const { roles, theirPastorId } = createCopastorDto;

    // Validations
    const pastor = await this.pastorRepository.findOneBy({
      id: theirPastorId,
    });

    if (!pastor) {
      throw new NotFoundException(`Not found pastor with id ${theirPastorId}`);
    }

    if (!pastor.status) {
      throw new BadRequestException(
        `The property status in Pastor must be a "Active"`,
      );
    }

    if (
      !roles.includes(MemberRoles.Disciple) &&
      !roles.includes(MemberRoles.Copastor)
    ) {
      throw new BadRequestException(
        `El rol "disciple" y "copastor" debe ser incluido`,
      );
    }

    if (
      roles.includes(MemberRoles.Pastor) ||
      roles.includes(MemberRoles.Supervisor) ||
      roles.includes(MemberRoles.Preacher) ||
      roles.includes(MemberRoles.Treasurer)
    ) {
      throw new BadRequestException(
        `Para crear un Copastor solo se debe tener los roles "discípulo" y "copastor"`,
      );
    }

    // Create new instance
    if (
      roles.includes(MemberRoles.Copastor) &&
      roles.includes(MemberRoles.Disciple)
    ) {
      try {
        const newDisciple = this.discipleRepository.create({
          ...createCopastorDto,
          theirPastorId: pastor,
          createdBy: user,
          createdAt: new Date(),
        });

        await this.discipleRepository.save(newDisciple);

        const newCopastor = this.copastorRepository.create({
          discipleId: newDisciple,
          theirPastorId: pastor,
          createdAt: new Date(),
          createdBy: user,
        });

        await this.pastorRepository.save(newCopastor);

        return newCopastor;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Copastor[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.copastorRepository.find({
      where: { status: Status.Active },
      take: limit,
      skip: offset,
      order: { createdAt: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Copastor[] | Copastor> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let coPastor: Copastor | Copastor[];

    //* Find ID --> One (active or inactive)
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.copastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new NotFoundException(`Copastor was not found with this UUID`);
      }

      // TODO : Tratar de poner el conteo con en @After o BeforeInsert en el modulo que corresponde para que haga el conteo
      // TODO : de todo al crear una nueva instancia se contabiliza y se asigne nuevamente
      // TODO : El problema es que va ser desde otro modulo pero averiguar como hacerlo
      //* Count and assignment of Houses
      const familyHouses = await this.familyHouseRepository.find();
      const listFamilyHouses = familyHouses.filter(
        (home) => home.theirCopastorId?.id === term && home.status,
      );

      const familyHousesId = listFamilyHouses.map((houses) => houses.id);

      //* Counting and assigning Preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.theirCopastorId?.id === term && preacher.status,
      );

      const listPreachersID = listPreachers.map((preacher) => preacher.id);

      coPastor.numberPreachers = listPreachersID.length;
      coPastor.preachersId = listPreachersID;

      coPastor.numberFamilyHouses = familyHousesId.length;
      coPastor.familyHousesId = familyHousesId;

      //* Update age, when querying by ID
      coPastor.discipleId.age = updateAge(coPastor.discipleId);

      await this.copastorRepository.save(coPastor);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.copastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.copastorRepository,
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
        type_entity: TypeEntity.copastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.copastorRepository,
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
        type_entity: TypeEntity.copastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.discipleRepository,
        entity_repository: this.copastorRepository,
      });

      return resultSearch;
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const coPastores = await this.copastorRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { createdAt: 'ASC' },
        });

        if (coPastores.length === 0) {
          throw new NotFoundException(
            `Not found coPastores with these names: ${term}`,
          );
        }

        return coPastores;
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
      type_of_name !== SearchTypeOfName.copastorMember &&
      type_of_name !== SearchTypeOfName.copastorPastor
    ) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.copastorMember} and ${SearchTypeOfName.copastorPastor}`,
      );
    }

    if (!coPastor)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return coPastor;
  }

  //* UPDATE FOR ID
  async update(
    id: string,
    updateCopastorDto: UpdateCopastorDto,
    user: User,
  ): Promise<Copastor | Disciple> {
    const { roles, status, theirPastorId } = updateCopastorDto;

    // Validations
    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the pastor`,
      );
    }
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const copastor = await this.copastorRepository.findOneBy({ id });

    if (!copastor) {
      throw new NotFoundException(`Copastor not found with id: ${id}`);
    }

    const disciple = await this.discipleRepository.findOne({
      where: { id: copastor.discipleId.id },
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

    if (!roles.some((role) => ['disciple', 'copastor'].includes(role))) {
      throw new BadRequestException(
        `The roles should include "disciple" and "preacher"`,
      );
    }

    if (
      disciple.roles.includes(MemberRoles.Copastor) &&
      disciple.roles.includes(MemberRoles.Disciple) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Copastor) &&
      (roles.includes(MemberRoles.Supervisor) ||
        roles.includes(MemberRoles.Pastor) ||
        roles.includes(MemberRoles.Preacher) ||
        roles.includes(MemberRoles.Treasurer))
    ) {
      throw new BadRequestException(
        `A lower or high role cannot be assigned without going through the hierarchy: [preacher, supervisor, co-pastor, pastor]`,
      );
    }

    //* Update info about Pastor
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Pastor) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Treasurer) &&
      roles.includes(MemberRoles.Disciple) &&
      roles.includes(MemberRoles.Copastor) &&
      !roles.includes(MemberRoles.Pastor) &&
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

      if (copastor.status === Status.Active && status === Status.Inactive) {
        throw new BadRequestException(
          `You cannot update it to "inactive", you must delete the record`,
        );
      }

      //* Calculate and assign
      // Calculate number of supervisors by co-pastor and assign Ids
      const allSupervisors = await this.preacherRepository.find();
      const listSupervisors = allSupervisors.filter(
        (supervisor) => supervisor.theirCopastorId?.id === copastor.id,
      );

      const listSupervisorsId = listSupervisors.map(
        (supervisor) => supervisor.id,
      );

      // Calculate number of preachers by co-pastor and assign Ids
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.theirCopastorId?.id === copastor.id,
      );

      const listPreachersId = listPreachers.map((preacher) => preacher.id);

      // Calculate number of Zones by co-pastor and assign Ids
      const allZones = await this.zoneRepository.find();
      const listZones = allZones.filter(
        (zone) => zone.theirCopastorId?.id === copastor.id,
      );

      const listZonesId = listZones.map((preacher) => preacher.id);

      // Calculate number of Family Houses by co-pastor and assign Ids
      const allFamilyHouses = await this.familyHouseRepository.find();
      const listFamilyHouses = allFamilyHouses.filter(
        (familyHouse) => familyHouse.theirCopastorId?.id === copastor.id,
      );

      const listFamilyHousesId = listFamilyHouses.map(
        (familyHouse) => familyHouse.id,
      );

      // Calculate number of Disciples by co-pastor and assign Ids
      const allDisciples = await this.discipleRepository.find();
      const listDisciples = allDisciples.filter(
        (familyHouse) => familyHouse.theirCopastorId?.id === copastor.id,
      );

      const listDisciplesId = listDisciples.map((disciple) => disciple.id);

      //* Update if theirPastorId is different
      if (copastor.theirPastorId.id !== theirPastorId) {
        const pastor = await this.pastorRepository.findOneBy({
          id: theirPastorId,
        });

        if (!pastor) {
          throw new NotFoundException(
            `Pastor not found with id ${theirPastorId}`,
          );
        }

        if (!pastor.status) {
          throw new BadRequestException(
            `The property status in pastor must be "Active"`,
          );
        }

        // All members by module
        const allSupervisors = await this.preacherRepository.find();
        const allPreachers = await this.preacherRepository.find();
        const allZones = await this.zoneRepository.find();
        const allFamilyHouses = await this.familyHouseRepository.find();
        const allDisciples = await this.discipleRepository.find();

        // Update in all supervisors the new pastor of the co-pastor that is updated.
        const supervisorsByCopastor = allSupervisors.filter(
          (supervisor) => supervisor.theirCopastorId?.id === copastor.id,
        );

        const promisesSupervisor = supervisorsByCopastor.map(
          async (supervisor) => {
            await this.supervisorRepository.update(supervisor.id, {
              theirPastorId: pastor,
            });
          },
        );

        // Update in all preachers the new pastor of the co-pastor that is updated.
        const preachersByCoPastor = allPreachers.filter(
          (preacher) => preacher.theirCopastorId?.id === copastor.id,
        );

        const promisesPreacher = preachersByCoPastor.map(async (preacher) => {
          await this.preacherRepository.update(preacher.id, {
            theirPastorId: pastor,
          });
        });

        // Update in all zones the new pastor of the co-pastor that is updated.
        const zonesByCopastor = allZones.filter(
          (preacher) => preacher.theirCopastorId?.id === copastor.id,
        );

        const promisesZones = zonesByCopastor.map(async (zone) => {
          await this.zoneRepository.update(zone.id, {
            theirPastorId: pastor,
          });
        });

        // Update in all family homes the new co-pastor that is updated.
        const familyHousesByCopastor = allFamilyHouses.filter(
          (familyHome) => familyHome.theirCopastorId?.id === copastor.id,
        );

        const promisesFamilyHouses = familyHousesByCopastor.map(
          async (familyHome) => {
            await this.familyHouseRepository.update(familyHome.id, {
              theirPastorId: pastor,
            });
          },
        );

        // Update on all disciples the new pastor of the co-pastor that is updated.
        const disciplesByCopastor = allDisciples.filter(
          (disciple) => disciple.theirCopastorId?.id === copastor.id,
        );

        const promisesDisciples = disciplesByCopastor.map(async (disciple) => {
          await this.discipleRepository.update(disciple.id, {
            theirPastorId: pastor,
          });
        });

        // Update and save
        const updatedDisciple = await this.discipleRepository.preload({
          id: disciple.id,
          ...updateCopastorDto,
          theirPastorId: pastor,
          status: status,
          updatedAt: new Date(),
          updatedBy: user,
        });

        const updatedCopastor = await this.copastorRepository.preload({
          id: id,
          discipleId: updatedDisciple,
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
          theirPastorId: pastor,
          updatedAt: new Date(),
          updatedBy: user,
          status: status,
        });

        try {
          await this.discipleRepository.save(updatedDisciple);
          await this.copastorRepository.save(updatedCopastor);
          await Promise.all(promisesSupervisor);
          await Promise.all(promisesPreacher);
          await Promise.all(promisesFamilyHouses);
          await Promise.all(promisesZones);
          await Promise.all(promisesDisciples);
        } catch (error) {
          this.handleDBExceptions(error);
        }
        return updatedCopastor;
      }

      // TODO : Para no repetir el contabilizar y asignar Ids hacer con @AfterUpdate (averiguar)
      // Update and save if is same Pastor
      const updatedDisciple = await this.discipleRepository.preload({
        id: disciple.id,
        ...updateCopastorDto,
        theirPastorId: copastor.theirPastorId,
        status: status,
        updatedAt: new Date(),
        updatedBy: user,
      });

      const updatedCopastor = await this.copastorRepository.preload({
        id: id,
        discipleId: updatedDisciple,
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
        theirPastorId: copastor.theirPastorId,
        updatedAt: new Date(),
        updatedBy: user,
        status: status,
      });

      try {
        await this.discipleRepository.save(updatedDisciple);
        await this.copastorRepository.save(updatedCopastor);
      } catch (error) {
        this.handleDBExceptions(error);
      }
      return updatedCopastor;
    }

    // TODO : aquí tmb verificar si aplica el @AfterUpdate (cuidado al eliminar no habrá el id), usar ? para que no entre o de error
    //* Raise Co-pastor level to Pastor
    if (
      disciple.roles.includes(MemberRoles.Disciple) &&
      disciple.roles.includes(MemberRoles.Copastor) &&
      !disciple.roles.includes(MemberRoles.Treasurer) &&
      !disciple.roles.includes(MemberRoles.Supervisor) &&
      !disciple.roles.includes(MemberRoles.Preacher) &&
      !disciple.roles.includes(MemberRoles.Pastor) &&
      roles.includes(MemberRoles.Disciple) &&
      roles.includes(MemberRoles.Copastor) &&
      !roles.includes(MemberRoles.Treasurer) &&
      !roles.includes(MemberRoles.Supervisor) &&
      !roles.includes(MemberRoles.Pastor) &&
      !roles.includes(MemberRoles.Preacher) &&
      status === Status.Active
    ) {
      const theirPastor = null;

      // TODO : primero buscar el id del copastor y actualizar cada lugar que lo tiene a null
      // TODO : una vez hecho esto eliminar y setear el disciple a pastor y crear el pastor.
      // Update and save
      const updatedDisciple = await this.discipleRepository.preload({
        id: disciple.id,
        ...updateCopastorDto,
        theirPastorId: theirPastor,
        updatedAt: new Date(),
        updatedBy: user,
      });

      try {
        const savedDisciple =
          await this.discipleRepository.save(updatedDisciple);

        const newPastor = this.pastorRepository.create({
          discipleId: savedDisciple,
          createdAt: new Date(),
          createdBy: user,
        });

        await this.pastorRepository.save(newPastor);
        return savedDisciple;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      throw new BadRequestException(
        `You cannot level up, you must have the "Active"`,
      );
    }
  }

  //! DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    // Validations
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const copastor = await this.copastorRepository.findOneBy({ id });

    if (!copastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }
    //* Update and set in "Inactive" on Disciple
    const updatedDisciple = await this.discipleRepository.preload({
      id: copastor.discipleId.id,
      theirPastorId: null,
      theirCopastorId: null,
      theirSupervisorId: null,
      theirFamilyHouseId: null,
      updatedAt: new Date(),
      updatedBy: user,
      status: Status.Inactive,
    });

    //* Update and set in Inactive on Copastor
    const updatedCopastor = await this.copastorRepository.preload({
      id: copastor.id,
      theirPastorId: null,
      updatedAt: new Date(),
      updatedBy: user,
      status: Status.Inactive,
    });

    // Update and set to null relationships in Supervisor (who have same Copastor)
    const allSupervisors = await this.supervisorRepository.find();
    const supervisorsByCopastor = allSupervisors.filter(
      (supervisor) => supervisor.theirCopastorId?.id === copastor.id,
    );

    const promisesSupervisor = supervisorsByCopastor.map(async (supervisor) => {
      await this.supervisorRepository.update(supervisor.id, {
        theirCopastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Zones (who have same Copastor)
    const allZones = await this.supervisorRepository.find();
    const zonesByCopastor = allZones.filter(
      (zone) => zone.theirCopastorId?.id === copastor.id,
    );

    const promisesZone = zonesByCopastor.map(async (zone) => {
      await this.supervisorRepository.update(zone.id, {
        theirCopastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Preacher (who have same Copastor)
    const allPreachers = await this.preacherRepository.find();
    const preachersByCopastor = allPreachers.filter(
      (preacher) => preacher.theirCopastorId?.id === copastor.id,
    );

    const promisesPreacher = preachersByCopastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        theirCopastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and set to null relationships in Family House (who have same Copastor)
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByCopastor = allFamilyHouses.filter(
      (familyHome) => familyHome.theirCopastorId?.id === copastor.id,
    );

    const promisesFamilyHouses = familyHousesByCopastor.map(
      async (familyHome) => {
        await this.familyHouseRepository.update(familyHome.id, {
          theirPastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      },
    );

    // Update and set to null relationships in Disciple, all those who have the same Copastor.
    const allDisciples = await this.discipleRepository.find({
      relations: ['their_copastor'],
    });

    const disciplesByCopastor = allDisciples.filter(
      (disciple) => disciple.theirCopastorId?.id === copastor.id,
    );

    const promisesDisciples = disciplesByCopastor.map(async (disciple) => {
      await this.discipleRepository.update(disciple.id, {
        theirPastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    // Update and save
    try {
      await this.discipleRepository.save(updatedDisciple);
      await this.copastorRepository.save(updatedCopastor);
      await Promise.all(promisesSupervisor);
      await Promise.all(promisesPreacher);
      await Promise.all(promisesZone);
      await Promise.all(promisesFamilyHouses);
      await Promise.all(promisesDisciples);
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
}
