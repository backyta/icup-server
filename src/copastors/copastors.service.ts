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
import { CoPastor } from './entities/copastor.entity';

import { Pastor } from '../pastors/entities/pastor.entity';
import { Member } from '../members/entities/member.entity';
import { Preacher } from '../preachers/entities/preacher.entity';
import { FamilyHouse } from '../family-houses/entities/family-house.entity';
import { User } from '../users/entities/user.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { updateAge, searchPeopleBy } from '../common/helpers';

import { SearchType, TypeEntity, SearchTypeOfName } from '../common/enums';

@Injectable()
export class CoPastorsService {
  private readonly logger = new Logger('CoPastorsService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE COPASTOR
  async create(
    createCoPastorDto: CreateCoPastorDto,
    user: User,
  ): Promise<CoPastor> {
    const { member_id, their_pastor } = createCoPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: member_id,
    });

    if (!member) {
      throw new NotFoundException(`Not found Member with id ${member_id}`);
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `The id_member must have the role of "CoPastor"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: their_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Not found Pastor with id ${their_pastor}`);
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Creation instances
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      their_pastor: pastor,
    });

    try {
      const coPastorInstance = this.coPastorRepository.create({
        member: member,
        their_pastor: pastor,
        created_at: new Date(),
        created_by: user,
      });

      await this.memberRepository.save(dataMember);
      return await this.coPastorRepository.save(coPastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<CoPastor[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.coPastorRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<CoPastor[] | CoPastor> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let coPastor: CoPastor | CoPastor[];

    //* Find ID --> One (active or inactive)
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.coPastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new NotFoundException(`Copastor was not found with this UUID`);
      }

      //* Count and assignment of Houses
      const familyHouses = await this.familyHouseRepository.find();
      const listFamilyHouses = familyHouses.filter(
        (home) => home.their_copastor?.id === term && home.is_active,
      );

      const familyHousesId = listFamilyHouses.map((houses) => houses.id);

      //* Counting and assigning Preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) =>
          preacher.their_copastor?.id === term && preacher.is_active,
      );

      const listPreachersID = listPreachers.map((preacher) => preacher.id);

      coPastor.count_preachers = listPreachersID.length;
      coPastor.preachers = listPreachersID;

      coPastor.count_houses = familyHousesId.length;
      coPastor.family_houses = familyHousesId;

      //* Update age, when querying by ID
      coPastor.member.age = updateAge(coPastor.member);

      await this.coPastorRepository.save(coPastor);
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
        search_repository: this.memberRepository,
        entity_repository: this.coPastorRepository,
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
        search_repository: this.memberRepository,
        entity_repository: this.coPastorRepository,
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
        search_repository: this.memberRepository,
        entity_repository: this.coPastorRepository,
      });

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
          order: { created_at: 'ASC' },
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

  //NOTE: it is updated to is_active true, and it also sets updated data to CoPastor and Member ✅✅
  //* UPDATE FOR ID
  async update(
    id: string,
    updateCoPastorDto: UpdateCoPastorDto,
    user: User,
  ): Promise<CoPastor> {
    const { their_pastor, is_active, member_id } = updateCoPastorDto;

    if (!member_id) {
      throw new BadRequestException(
        `member_id should not be sent, member id cannot be updated`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor not found with id: ${id}`);
    }

    //* Member assignment and validation
    const member = await this.memberRepository.findOneBy({
      id: dataCoPastor.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataCoPastor.member.id}`,
      );
    }

    //* Pastor assignment and validation
    const pastor = await this.pastorRepository.findOneBy({
      id: their_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //! it will only affect the co-pastor and his member-copastor.
    //* Update on all members the new pastor of the co-pastor that is updated.
    const allMembers = await this.memberRepository.find();
    const membersByCoPastor = allMembers.filter(
      (member) => member.their_copastor?.id === dataCoPastor.id,
    );

    const promisesMembers = membersByCoPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
        their_family_home: null,
      });
    });

    //* Update in all preachers the new pastor of the copastor that is updated.
    const allPreachers = await this.preacherRepository.find();
    const preachersByCoPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === dataCoPastor.id,
    );

    const promisesPreacher = preachersByCoPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_pastor: null,
        their_copastor: null,
        family_home: null,
        members: null,
      });
    });

    //* Update in all family homes the new co-pastor pastor that is updated.
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor?.id === dataCoPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHouseRepository.update(familyHome.id, {
          their_pastor: null,
          their_copastor: null,
          their_preacher: null,
          members: null,
        });
      },
    );

    //* Count and assignment of Houses
    const familyHouses = await this.familyHouseRepository.find();
    const listFamilyHouses = familyHouses.filter(
      (home) => home.their_copastor?.id === id,
    );

    const familyHousesId = listFamilyHouses.map((houses) => houses.id);

    //* Counting and assigning Preachers
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === id,
    );

    const listPreachersId = listPreachers.map((preacher) => preacher.id);

    //* Co-pastor their_pastor updated in Member-Module
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updateCoPastorDto,
      their_pastor: pastor,
      is_active: is_active,
      updated_at: new Date(),
      updated_by: user,
    });

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      family_houses: familyHousesId,
      count_houses: listFamilyHouses.length,
      preachers: listPreachersId,
      count_preachers: listPreachers.length,
      member: dataMember,
      is_active: is_active,
      their_pastor: pastor,
      updated_at: new Date(),
      updated_by: user,
    });

    try {
      await this.memberRepository.save(dataMember);
      await this.coPastorRepository.save(coPastor);
      await Promise.all(promisesMembers);
      await Promise.all(promisesPreacher);
      await Promise.all(promisesFamilyHouses);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return coPastor;
  }

  //* DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      their_pastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set in false is_active on coPastor
    const coPastor = await this.coPastorRepository.preload({
      id: dataCoPastor.id,
      their_pastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set to null in Preacher
    const allPreachers = await this.preacherRepository.find();
    const preachersByPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === dataCoPastor.id,
    );

    const promisesPreacher = preachersByPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_copastor: null,
        their_pastor: null,
        family_home: null,
        members: null,
        updated_at: new Date(),
        updated_by: user,
      });
    });

    //* Update and set to null in Family Home
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor?.id === coPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHouseRepository.update(familyHome.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
          members: null,
          updated_at: new Date(),
          updated_by: user,
        });
      },
    );

    //* Update and set to null in Member, all those who have the same coPastor
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });
    const membersByPastor = allMembers.filter(
      (member) => member.their_copastor?.id === dataCoPastor.id,
    );

    const promisesMembers = membersByPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
        their_family_home: !member.their_preacher
          ? null
          : member.their_family_home,
        updated_at: new Date(),
        updated_by: user,
      });
    });

    try {
      await this.memberRepository.save(member);
      await this.coPastorRepository.save(coPastor);
      await Promise.all(promisesMembers);
      await Promise.all(promisesPreacher);
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
}
