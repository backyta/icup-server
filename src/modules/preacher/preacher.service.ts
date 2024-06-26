import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

import { updateAge, searchPeopleBy } from '@/common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { SearchType, TypeEntity, SearchTypeOfName } from '@/common/enums';

import { Preacher } from '@/modules/preacher/entities';
import { CreatePreacherDto, UpdatePreacherDto } from '@/modules/preacher/dto';

import { User } from '@/modules/user/entities';
import { Disciple } from '@/modules/disciple/entities';
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { FamilyHouse } from '@/modules/family-house/entities';

import { Status } from '@/modules/disciple/enums';

@Injectable()
export class PreacherService {
  private readonly logger = new Logger('PreacherService');

  constructor(
    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(Disciple)
    private readonly memberRepository: Repository<Disciple>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly coPastorRepository: Repository<Copastor>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE PREACHER
  async create(createPreacherDto: CreatePreacherDto, user: User) {
    const { member_id, theirCopastorId: their_copastor } = createPreacherDto;

    const member = await this.memberRepository.findOneBy({
      id: member_id,
    });

    if (!member) {
      throw new NotFoundException(`Not found Member with id ${member_id}`);
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
        `Not found CoPastor with id ${their_copastor}`,
      );
    }

    if (!copastor.status) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    if (!copastor.theirPastorId) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.theirPastorId.id,
    });

    if (!pastor.status) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Creation instances
    // TODO : poner supervisor
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      theirPastorId: pastor,
      theirCopastorId: copastor,
    });

    try {
      const preacherInstance = this.preacherRepository.create({
        discipleId: member,
        theirPastorId: pastor,
        theirCopastorId: copastor,
        createdAt: new Date(),
        createdBy: user,
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
      order: { createdAt: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Preacher | Preacher[]> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let preacher: Preacher | Preacher[];

    //* Find ID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      preacher = await this.preacherRepository.findOneBy({ id: term });

      if (!preacher) {
        throw new NotFoundException(`Preacher was not found with this UUID`);
      }

      //* Counting and assigning the number of members (id-preacher member table)
      const allMembers = await this.memberRepository.find({
        relations: ['their_preacher'],
      });

      const membersOfPreacher = allMembers.filter(
        (members) => members.theirPreacherId?.id === term,
      );

      const listMembersID = membersOfPreacher.map(
        (copastores) => copastores.id,
      );

      //* House ID assignment according to Preacher ID
      const familyHouses = await this.familyHouseRepository.find();
      const familyHome = familyHouses.find(
        (home) => home.theirPreacherId.id === term,
      );

      preacher.numberDisciples = listMembersID.length;
      preacher.disciplesId = listMembersID;

      preacher.familyHousesId = [familyHome.id];

      //* Update age, when querying by ID
      preacher.discipleId.age = updateAge(preacher.discipleId);

      await this.preacherRepository.save(preacher);
    }

    //! Search Preachers by Preacher or Copastor names
    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.preacherEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.preacherRepository,
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
        type_entity: TypeEntity.preacherEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.preacherRepository,
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
        type_entity: TypeEntity.preacherEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.preacherRepository,
      });

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
        throw new NotFoundException(
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
          order: { createdAt: 'ASC' },
        });

        if (preachers.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with this term: ${term}`,
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
      type_of_name !== SearchTypeOfName.preacherCopastor &&
      type_of_name !== SearchTypeOfName.preacherMember
    ) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.preacherCopastor} or ${SearchTypeOfName.preacherMember}`,
      );
    }

    if (!preacher)
      throw new NotFoundException(`CoPastor with this ${term} not found`);

    return preacher;
  }

  //NOTE: it is updated to is_active true, and it also sets updated data to Preacher and Member ✅✅
  //* UPDATE PREACHER
  async update(
    id: string,
    updatePreacherDto: UpdatePreacherDto,
    user: User,
  ): Promise<Preacher> {
    const {
      theirCopastorId: their_copastor,
      status,
      member_id,
    } = updatePreacherDto;

    if (!member_id) {
      throw new BadRequestException(
        `member_id should not be sent, member id cannot be updated`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    //* Member assignment and validation
    const dataMember = await this.memberRepository.findOneBy({
      id: dataPreacher.discipleId.id,
    });

    if (!dataMember) {
      throw new NotFoundException(
        `Member not found with id ${dataPreacher.discipleId.id}`,
      );
    }

    //* Copastor assignment and validation
    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(`Pastor not found with id ${their_copastor}`);
    }

    if (!copastor.status) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value`,
      );
    }

    //* Pastor Assignment and Validation, according to the co-Pastor.
    if (!copastor.theirPastorId) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.theirPastorId.id,
    });

    if (!pastor?.status) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value`,
      );
    }

    //* Setear a null si el copastor es diferente, porque el preacher cambio de zona (copastor)
    const allMembers = await this.memberRepository.find();
    const membersByPreacher = allMembers.filter(
      (member) => member.theirPreacherId?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      if (member.theirCopastorId.id !== copastor.id) {
        await this.memberRepository.update(member.id, {
          theirCopastorId: null,
          theirPastorId: null,
          theirPreacherId: null,
        });
      }
    });

    //* If you find a house with the preacher and your co-pastor is different from the one we want to update (delete relationships)
    const allFamilyHouses = await this.familyHouseRepository.find();
    const dataFamilyHomeByPreacher = allFamilyHouses.find(
      (home) => home.theirPreacherId?.id === dataPreacher.id,
    );

    let updateFamilyHome: FamilyHouse;
    if (
      dataFamilyHomeByPreacher &&
      (dataFamilyHomeByPreacher?.theirCopastorId?.id !== copastor.id ||
        dataFamilyHomeByPreacher?.theirPastorId?.id !== pastor.id)
    ) {
      updateFamilyHome = await this.familyHouseRepository.preload({
        id: dataFamilyHomeByPreacher?.id,
        theirPreacherId: null,
        theirCopastorId: null,
        theirPastorId: null,
      });
    }

    //* Counting and assigning the number of members (id-preacher member table)
    const membersPreacher = allMembers.filter(
      (member) => member.theirPreacherId?.id === dataPreacher.id,
    );

    const listMembersID = membersPreacher.map((preacher) => preacher.id);

    //* House ID assignment when searching for Preacher
    const familyHouses = await this.familyHouseRepository.find();
    const familyHome = familyHouses.filter(
      (home) => home.theirPreacherId?.id === dataPreacher.id,
    );

    const familyHomeId = familyHome.map((home) => home.id);

    //* Update Preacher and Member-Preacher, their_co-pastor and their_pastor.
    try {
      const member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updatePreacherDto,
        theirPastorId: pastor,
        theirCopastorId: copastor,
        theirFamilyHouseId:
          dataMember.theirCopastorId?.id !== copastor.id
            ? null
            : dataMember.theirFamilyHouseId,
        status: status,
        updatedAt: new Date(),
        updatedBy: user,
      });

      await this.memberRepository.save(member);

      const preacher = await this.preacherRepository.preload({
        id: dataPreacher.id,
        discipleId: dataMember,
        theirPastorId: pastor,
        theirCopastorId: copastor,
        disciplesId: listMembersID,
        numberDisciples: listMembersID.length,
        familyHousesId: familyHomeId,
        status: status,
        updatedAt: new Date(),
        updatedBy: user,
      });

      await this.preacherRepository.save(preacher);
      updateFamilyHome &&
        (await this.familyHouseRepository.save(updateFamilyHome));
      await Promise.all(promisesMembers);

      return preacher;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataPreacher.discipleId.id,
      theirCopastorId: null,
      theirPastorId: null,
      theirFamilyHouseId: null,
      status: Status.Inactive,
      updatedAt: new Date(),
      updatedBy: user,
    });

    //* Update and set in false is_active on Preacher
    const preacher = await this.preacherRepository.preload({
      id: dataPreacher.id,
      theirPastorId: null,
      theirCopastorId: null,
      status: Status.Inactive,
      updatedAt: new Date(),
      updatedBy: user,
    });

    //* Update and set to null in Family Home
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByPreacher = allFamilyHouses.filter(
      (familyHome) => familyHome.theirPreacherId?.id === preacher.id,
    );

    const promisesFamilyHouses = familyHousesByPreacher.map(
      async (familyHome) => {
        await this.familyHouseRepository.update(familyHome.id, {
          theirPreacherId: null,
          theirPastorId: null,
          theirCopastorId: null,
          updatedAt: new Date(),
          updatedBy: user,
        });
      },
    );

    //* Update and set to null in Member, all those who have the same Preacher
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });
    const membersByPreacher = allMembers.filter(
      (member) => member.theirPreacherId?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      await this.memberRepository.update(member.id, {
        theirPreacherId: null,
        theirPastorId: null,
        theirCopastorId: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    try {
      await this.memberRepository.save(member);
      await this.preacherRepository.save(preacher);
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
}
