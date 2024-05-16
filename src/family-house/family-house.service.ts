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

import { CreateFamilyHouseDto, UpdateFamilyHouseDto } from '@/family-house/dto';

import { FamilyHouse } from '@/family-house/entities';

import { Preacher } from '@/preacher/entities';
import { Disciple } from '@/disciple/entities';
import { Pastor } from '@/pastor/entities';
import { CoPastor } from '@/copastor/entities';
import { User } from '@/user/entities';

import { searchPeopleBy } from '@/common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { SearchType, SearchTypeOfName, TypeEntity } from '@/common/enums';

@Injectable()
export class FamilyHouseService {
  private readonly logger = new Logger('FamilyHouseService');

  constructor(
    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(Disciple)
    private readonly memberRepository: Repository<Disciple>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE FAMILY HOME
  async create(createFamilyHouseDto: CreateFamilyHouseDto, user: User) {
    const { their_preacher, zone_house } = createFamilyHouseDto;

    //* Validation Preacher
    const preacher = await this.preacherRepository.findOneBy({
      id: their_preacher,
    });

    if (!preacher) {
      throw new NotFoundException(
        `Not found CoPastor with id ${their_preacher}`,
      );
    }

    if (!preacher.status) {
      throw new BadRequestException(
        `The property is_active in Preacher must be a true value"`,
      );
    }

    //* Validation copastor
    if (!preacher.their_copastor) {
      throw new NotFoundException(
        `CoPastor was not found, verify that Preacher has a copastor assigned`,
      );
    }

    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher?.their_copastor.id,
    });

    if (!copastor.status) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Validation pastor
    if (!preacher.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Preacher has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: preacher?.their_pastor.id,
    });

    if (!pastor.status) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //! Validation of zone assignment by copastor and preacher
    const allHouses = await this.familyHouseRepository.find();
    const allHousesByZone = allHouses.filter(
      (home) => home.zone_house === zone_house.toUpperCase(),
    );

    const familyHomeByZone = allHouses.find(
      (house) =>
        house.zone_house === zone_house.toUpperCase() ||
        house.their_copastor.id === copastor.id ||
        house.their_pastor.id === pastor.id,
    );

    //* Check if there is a reference with co-pastor, pastor and zone, that these are the same.
    if (
      familyHomeByZone &&
      ((familyHomeByZone.their_copastor.id !== copastor.id &&
        familyHomeByZone.their_pastor.id !== pastor.id) ||
        familyHomeByZone.zone_house !== zone_house.toUpperCase())
    ) {
      throw new BadRequestException(
        `You cannot assign a preacher with a copastor and pastor different from the one already used for this zone: Zone-${familyHomeByZone.zone_house}, CoPastor: ${familyHomeByZone.their_copastor.member.firstName} ${familyHomeByZone.their_copastor.member.lastName}, Pastor: ${familyHomeByZone.their_pastor.member.firstName} ${familyHomeByZone.their_pastor.member.lastName}`,
      );
    }

    let numberHome: number;
    let codeHome: string;

    if (allHousesByZone.length === 0) {
      numberHome = 1;
      codeHome = `${zone_house.toUpperCase()}-${numberHome}`;
    }

    if (allHousesByZone.length !== 0) {
      numberHome = allHousesByZone.length + 1;
      codeHome = `${zone_house.toUpperCase()}-${numberHome}`;
    }

    //* Creation of the instance
    try {
      const familyHomeInstance = this.familyHouseRepository.create({
        ...createFamilyHouseDto,
        number_house: numberHome.toString(),
        zone_house: zone_house.toUpperCase(),
        code_house: codeHome,
        their_preacher: preacher,
        their_pastor: pastor,
        their_copastor: copastor,
        created_at: new Date(),
        created_by: user,
      });

      const result = await this.familyHouseRepository.save(familyHomeInstance);

      //* Set in Member the id of the house created related to the Preacher
      const updateMemberTheirFamilyHome = await this.memberRepository.preload({
        id: preacher.member.id,
        theirFamilyHouse: familyHomeInstance,
      });

      await this.memberRepository.save(updateMemberTheirFamilyHome);
      return result;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.familyHouseRepository.find({
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<FamilyHouse | FamilyHouse[]> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let familyHome: FamilyHouse | FamilyHouse[];

    //* Find ID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      familyHome = await this.familyHouseRepository.findOneBy({ id: term });

      if (!familyHome) {
        throw new NotFoundException(`FamilyHome was not found with this UUI`);
      }

      //* Counting and assigning the number of members (id-familyHome member table)
      const allMembers = await this.memberRepository.find({
        relations: ['their_family_home'],
      });

      const membersFamilyHome = allMembers.filter(
        (members) => members.theirFamilyHouse?.id === term,
      );

      const listMembersId = membersFamilyHome.map((member) => member.id);

      familyHome.count_members = membersFamilyHome.length;
      familyHome.members = listMembersId;

      await this.familyHouseRepository.save(familyHome);
    }

    //! Search Family House by Preacher or Copastor names
    //* Find by first-name Preacher --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.familyHomeEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.familyHouseRepository,
      });

      return resultSearch;
    }

    //* Find by last-name Preacher --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.lastName,
        limit,
        offset,
        type_entity: TypeEntity.familyHomeEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.familyHouseRepository,
      });

      return resultSearch;
    }

    //* Find by full-name Preacher --> Many
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.fullName,
        limit,
        offset,
        type_entity: TypeEntity.familyHomeEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.familyHouseRepository,
      });

      return resultSearch;
    }

    //* Find Code --> One
    if (term && type === SearchType.code) {
      familyHome = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('UPPER(fh.code) LIKE UPPER(:term)', { term: `%${term}%` })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new NotFoundException(
          `No FamilyHome was found with this code: ${term}`,
        );
      }
    }

    //* Find Zone --> Many
    if (term && type === SearchType.zone) {
      familyHome = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('UPPER(fh.zone) LIKE UPPER(:term)', { term: `%${term}%` })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new NotFoundException(
          `No FamilyHome was found with this zone: ${term}`,
        );
      }
    }

    //* Find Address --> Many
    if (term && type === SearchType.address) {
      familyHome = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('LOWER(fh.address) LIKE LOWER(:term)', { term: `%${term}%` })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new NotFoundException(
          `No FamilyHome was found with this address: ${term}`,
        );
      }
    }

    //* Find Preacher --> One
    if (isUUID(term) && type === SearchType.their_preacher) {
      familyHome = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('fh.their_preacher = :term', { term })
        .andWhere('fh.is_active =:isActive', { isActive: true })
        .getOne();

      if (!familyHome) {
        throw new NotFoundException(
          `No FamilyHome was found with this their_preacher : ${term}`,
        );
      }
    }

    //* Find CoPastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      familyHome = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('fh.their_copastor =:term', { term })
        .andWhere('fh.is_active =:isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new NotFoundException(
          `No FamilyHome was found with this their_copastor: ${term}`,
        );
      }
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const familyHouses = await this.familyHouseRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { created_at: 'ASC' },
        });

        if (familyHouses.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }

        return familyHouses;
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
      type_of_name !== SearchTypeOfName.familyHouseCopastor &&
      type_of_name !== SearchTypeOfName.familyHousePreacher
    ) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.familyHouseCopastor} or ${SearchTypeOfName.familyHousePreacher}`,
      );
    }

    if (!familyHome)
      throw new NotFoundException(
        `Family Houses with this term: ${term} not found`,
      );

    return familyHome;
  }

  //NOTE: it is updated to is_active true, and it also sets updated data to Family_Home and Member family-home ✅✅

  //* UPDATE FAMILY HOME ID
  // TODO : desde el front probar si se pueda cambiar zona, osea de zona A a zona Tahua y cambia todas sus concidencias, Payet, porque la iglesia puede crecer
  async update(
    id: string,
    updateFamilyHomeDto: UpdateFamilyHouseDto,
    user: User,
  ) {
    const { their_preacher, is_active, zone_house } = updateFamilyHomeDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHouseRepository.findOneBy({ id });

    if (!dataFamilyHome) {
      throw new NotFoundException(`Family Home not found with id: ${id}`);
    }

    //* Preacher assignment and validation
    const preacher = await this.preacherRepository.findOneBy({
      id: their_preacher,
    });

    if (!preacher) {
      throw new NotFoundException(
        `Preacher Not found with id ${their_preacher}`,
      );
    }

    if (!preacher.status) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Copastor assignment and validation
    if (!preacher.their_copastor) {
      throw new NotFoundException(
        `CoPastor was not found, verify that Preacher has a copastor assigned`,
      );
    }
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor?.status) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Pastor assignment and validation
    if (!preacher.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Preacher has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: preacher.their_pastor.id,
    });

    if (!pastor?.status) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //* If there is data in their_copastor and their_pastor
    let updateFamilyHome: FamilyHouse;
    let updateFamilyHomePreacher: FamilyHouse;

    if (
      dataFamilyHome.their_preacher !== null &&
      dataFamilyHome.their_copastor !== null &&
      dataFamilyHome.their_pastor !== null
    ) {
      //* If you want to update a preacher with a different copastor to the area
      if (
        dataFamilyHome.their_copastor.id !== copastor.id ||
        dataFamilyHome.their_pastor.id !== pastor.id
      ) {
        throw new BadRequestException(
          `A family home cannot be assigned a different co-pastor or pastor than the one the zone already has: Zone-${dataFamilyHome.zone_house}, Copastor: ${dataFamilyHome.their_copastor.member.firstName} - ${dataFamilyHome.their_copastor.member.lastName}, Pastor: ${dataFamilyHome.their_pastor.member.firstName} - ${dataFamilyHome.their_pastor.member.lastName}, first co-pastor must be changed in the Preacher entity`,
        );
      }

      //* To place a new preacher in the family home he must be from the same area, previous relationships are eliminated.
      if (
        dataFamilyHome.their_copastor.id === copastor.id &&
        dataFamilyHome.their_pastor.id === pastor.id
      ) {
        //* Delete relationships from the old house
        updateFamilyHome = await this.familyHouseRepository.preload({
          id: dataFamilyHome.id,
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });

        //* We look to see if the preacher to be set is related to another house and we delete its relationships.
        const allFamilyHouses = await this.familyHouseRepository.find();
        const familyHomePreacher = allFamilyHouses.find(
          (home) => home.their_preacher?.id === preacher.id,
        );

        if (familyHomePreacher) {
          updateFamilyHomePreacher = await this.familyHouseRepository.preload({
            id: familyHomePreacher.id,
            their_preacher: null,
            their_copastor: null,
            their_pastor: null,
          });
        }
      }
    }

    //* If there is missing data in their_copastor and their_pastor
    let numberHome: number;
    let codeHome: string;
    let zoneHome: string;

    if (
      dataFamilyHome.their_pastor === null ||
      dataFamilyHome.their_copastor === null ||
      dataFamilyHome.their_preacher === null
    ) {
      if (!is_active) {
        throw new BadRequestException(
          `You must place a value in the is_active property`,
        );
      }
      const allHouses = await this.familyHouseRepository.find();
      const allHousesByZone = allHouses.filter(
        (home) => home.zone_house === zone_house,
      );

      //* Find out if the co-stor and pastor match the area
      const familyHomeByCopastor = allHouses.find(
        (home) =>
          home.their_copastor?.id === copastor.id &&
          home.their_pastor?.id === pastor.id,
      );

      //* If there is no co-pastor and pastor in this zone, this co-pastor and pastor are set to this zone.
      if (familyHomeByCopastor === undefined && !zone_house) {
        numberHome = +dataFamilyHome.number_house;
        codeHome = dataFamilyHome.code_house;
        zoneHome = dataFamilyHome.zone_house;
      }

      if (
        familyHomeByCopastor &&
        !zone_house &&
        dataFamilyHome.zone_house !== familyHomeByCopastor.zone_house
      ) {
        throw new BadRequestException(
          `You cannot assign a copastor that governs the zone ${familyHomeByCopastor.zone_house} to the zone ${dataFamilyHome.zone_house}, if you want to merge the family_home you must submit the new zone`,
        );
      }

      //* If a co-pastor is found who already governs this zone, the same values ​​are set for this house with its new preacher and co-pastor from the same zone.
      //! Crashes validation if preacher ID is being used
      if (familyHomeByCopastor && !zone_house) {
        numberHome = +dataFamilyHome.number_house;
        codeHome = dataFamilyHome.code_house;
        zoneHome = dataFamilyHome.zone_house;
      }

      if (
        familyHomeByCopastor &&
        zone_house &&
        familyHomeByCopastor.zone_house !== zone_house
      ) {
        throw new BadRequestException(
          `If you want to merge a family house to another zone, you must enter the correct zone according to the co-pastor`,
        );
      }

      //* Merging a house from one zone to another zone, the co-pastor and pastor are previously changed and the zone is sent to the DTO.
      if (
        familyHomeByCopastor &&
        familyHomeByCopastor.zone_house === zone_house &&
        dataFamilyHome.zone_house !== zone_house
      ) {
        numberHome = allHousesByZone.length + 1;
        codeHome = `${zone_house}-${numberHome}`;
        zoneHome = zone_house;
      }
    }

    //* Counting and assigning the number of members (id-familyHome member table)
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });

    const membersFamilyHome = allMembers.filter(
      (members) => members?.theirFamilyHouse?.id === dataFamilyHome.id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    //* Update or set the new preacher released to the family home, according to the condition.
    const familyHome = await this.familyHouseRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      code_house: codeHome,
      zone_house: zoneHome,
      number_house: numberHome?.toString(),
      is_active: is_active,
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: user,
    });

    //! Changes to Member-Preacher
    //* Removes the family_home from the previous member-preacher that will make the change (can be null).
    let updateOldFamilyHome: Disciple;
    if (dataFamilyHome.their_preacher) {
      updateOldFamilyHome = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        theirFamilyHouse: null,
      });
    }

    //* Find and eliminate the relationships of the new preacher to establish
    const familyHomeMember = allMembers.find(
      (member) => member.id === preacher.member.id,
    );

    let updateNewFamilyHome: Disciple;
    if (familyHomeMember) {
      updateNewFamilyHome = await this.memberRepository.preload({
        id: familyHomeMember.id,
        theirFamilyHouse: null,
      });
    }

    //* Set family home to preacher-member
    const updateMemberFamilyHome = await this.memberRepository.preload({
      id: preacher.member.id,
      theirFamilyHouse: familyHome,
    });

    //* Update, search all members with the same house and set the new preacher
    const arrayFamilyHomePreacher = allMembers.filter(
      (member) =>
        member?.theirFamilyHouse?.id === dataFamilyHome.id &&
        !member.roles.includes('preacher'),
    );

    //* Delete old data
    const promisesMemberHomeDelete = arrayFamilyHomePreacher.map(
      async (home) => {
        await this.memberRepository.update(home.id, {
          theirPreacher: null,
          theirCopastor: null,
          theirPastor: null,
        });
      },
    );

    //* Update new data
    const promisesMemberHomeUpdate = arrayFamilyHomePreacher.map(
      async (home) => {
        await this.memberRepository.update(home.id, {
          theirPreacher: preacher,
          theirCopastor: copastor,
          theirPastor: pastor,
        });
      },
    );
    try {
      updateFamilyHome &&
        (await this.familyHouseRepository.save(updateFamilyHome));
      updateFamilyHomePreacher &&
        (await this.familyHouseRepository.save(updateFamilyHomePreacher));
      await this.familyHouseRepository.save(familyHome);
      updateOldFamilyHome &&
        (await this.memberRepository.save(updateOldFamilyHome));
      await this.memberRepository.save(updateNewFamilyHome);
      await this.memberRepository.save(updateMemberFamilyHome);
      await Promise.all(promisesMemberHomeDelete);
      await Promise.all(promisesMemberHomeUpdate);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return familyHome;
  }

  //* DELETE FOR ID
  async remove(id: string, user: User) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHouseRepository.findOneBy({ id });

    if (!dataFamilyHome) {
      throw new NotFoundException(`Family Home with id: ${id} not exits`);
    }

    const familyHome = await this.familyHouseRepository.preload({
      id: dataFamilyHome.id,
      their_copastor: null,
      their_pastor: null,
      their_preacher: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and eliminate relations with their_family_home
    let member: Disciple;
    if (familyHome.their_copastor) {
      member = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        theirFamilyHouse: null,
      });
    }

    //* Update and set to null in Member, all those who have the same Family Home
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });

    const membersByFamilyHome = allMembers.filter(
      (member) => member.theirFamilyHouse?.id === dataFamilyHome.id,
    );

    const promisesMembers = membersByFamilyHome.map(async (member) => {
      await this.memberRepository.update(member.id, {
        theirFamilyHouse: null,
        theirCopastor: null,
        theirPastor: null,
        theirPreacher: null,
        updatedAt: new Date(),
        updatedBy: user,
      });
    });

    try {
      await this.familyHouseRepository.save(familyHome);
      member && (await this.memberRepository.save(member));
      await Promise.all(promisesMembers);
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

  //! DELETE FOR SEED
  async deleteAllFamilyHouses() {
    const query = this.familyHouseRepository.createQueryBuilder('houses');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
