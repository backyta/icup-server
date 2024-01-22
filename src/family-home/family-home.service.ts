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

import { CreateFamilyHomeDto } from './dto/create-family-home.dto';
import { UpdateFamilyHomeDto } from './dto/update-family-home.dto';
import { FamilyHome } from './entities/family-home.entity';

import { Preacher } from '../preacher/entities/preacher.entity';
import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { SearchType } from '../common/enums/search-types.enum';
import { searchFullname, searchPerson } from '../common/helpers';

@Injectable()
export class FamilyHomeService {
  private readonly logger = new Logger('FamilyHomeService');

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

  //* CREATE FAMILY HOME
  async create(createFamilyHomeDto: CreateFamilyHomeDto) {
    const { their_preacher, zone } = createFamilyHomeDto;

    //* Validation Preacher
    const preacher = await this.preacherRepository.findOneBy({
      id: their_preacher,
    });

    if (!preacher) {
      throw new NotFoundException(
        `Not found CoPastor with id ${their_preacher}`,
      );
    }

    if (!preacher.is_active) {
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

    if (!copastor.is_active) {
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

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //! Validation of zone assignment by copastor and preacher
    const allHouses = await this.familyHomeRepository.find();
    const allHousesByZone = allHouses.filter(
      (home) => home.zone === zone.toUpperCase(),
    );

    const familyHomeByZone = allHouses.find(
      (house) =>
        house.zone === zone.toUpperCase() ||
        house.their_copastor.id === copastor.id ||
        house.their_pastor.id === pastor.id,
    );

    //* Check if there is a reference with co-pastor, pastor and zone, that these are the same.
    if (
      familyHomeByZone &&
      ((familyHomeByZone.their_copastor.id !== copastor.id &&
        familyHomeByZone.their_pastor.id !== pastor.id) ||
        familyHomeByZone.zone !== zone.toUpperCase())
    ) {
      throw new BadRequestException(
        `You cannot assign a preacher with a copastor and pastor different from the one already used for this zone: Zone-${familyHomeByZone.zone}, CoPastor: ${familyHomeByZone.their_copastor.member.first_name} ${familyHomeByZone.their_copastor.member.last_name}, Pastor: ${familyHomeByZone.their_pastor.member.first_name} ${familyHomeByZone.their_pastor.member.last_name}`,
      );
    }

    let numberHome: number;
    let codeHome: string;

    if (allHousesByZone.length === 0) {
      numberHome = 1;
      codeHome = `${zone.toUpperCase()}-${numberHome}`;
    }

    if (allHousesByZone.length !== 0) {
      numberHome = allHousesByZone.length + 1;
      codeHome = `${zone.toUpperCase()}-${numberHome}`;
    }

    //* Creation of the instance
    try {
      const familyHomeInstance = this.familyHomeRepository.create({
        ...createFamilyHomeDto,
        number_home: numberHome.toString(),
        zone: zone.toUpperCase(),
        code: codeHome,
        their_preacher: preacher,
        their_pastor: pastor,
        their_copastor: copastor,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      const result = await this.familyHomeRepository.save(familyHomeInstance);

      //* Set in Member the id of the house created related to the Preacher
      const updateMemberTheirFamilyHome = await this.memberRepository.preload({
        id: preacher.member.id,
        their_family_home: familyHomeInstance,
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
    return await this.familyHomeRepository.find({
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let familyHome: FamilyHome | FamilyHome[];

    //* Find ID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      familyHome = await this.familyHomeRepository.findOneBy({ id: term });

      if (!familyHome) {
        throw new NotFoundException(`FamilyHome was not found with this UUI`);
      }

      //* Counting and assigning the number of members (id-familyHome member table)
      const allMembers = await this.memberRepository.find({
        relations: ['their_family_home'],
      });

      const membersFamilyHome = allMembers.filter(
        (members) => members.their_family_home?.id === term,
      );

      const listMembersId = membersFamilyHome.map((member) => member.id);

      familyHome.count_members = membersFamilyHome.length;
      familyHome.members = listMembersId;

      await this.familyHomeRepository.save(familyHome);
    }

    //! Search Family House by Preacher or Copastor names
    //* Find by first-name Preacher --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await this.searchFamilyHomeBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find by last-name Preacher --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await this.searchFamilyHomeBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find by full-name Preacher --> Many
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await this.searchFamilyHomeBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find Code --> One
    if (term && type === SearchType.code) {
      familyHome = await this.familyHomeRepository
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
      familyHome = await this.familyHomeRepository
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
      familyHome = await this.familyHomeRepository
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
      familyHome = await this.familyHomeRepository
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
      familyHome = await this.familyHomeRepository
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

        const familyHouses = await this.preacherRepository.find({
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
        type === SearchType.fullName) &&
      !type_of_name
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
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
  async update(id: string, updateFamilyHomeDto: UpdateFamilyHomeDto) {
    const { their_preacher, is_active, zone } = updateFamilyHomeDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHomeRepository.findOneBy({ id });

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

    if (!preacher.is_active) {
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

    if (!copastor?.is_active) {
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

    if (!pastor?.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //* If there is data in their_copastor and their_pastor
    let updateFamilyHome: FamilyHome;
    let updateFamilyHomePreacher: FamilyHome;

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
          `A family home cannot be assigned a different co-pastor or pastor than the one the zone already has: Zone-${dataFamilyHome.zone}, Copastor: ${dataFamilyHome.their_copastor.member.first_name} - ${dataFamilyHome.their_copastor.member.last_name}, Pastor: ${dataFamilyHome.their_pastor.member.first_name} - ${dataFamilyHome.their_pastor.member.last_name}, first co-pastor must be changed in the Preacher entity`,
        );
      }

      //* To place a new preacher in the family home he must be from the same area, previous relationships are eliminated.
      if (
        dataFamilyHome.their_copastor.id === copastor.id &&
        dataFamilyHome.their_pastor.id === pastor.id
      ) {
        //* Delete relationships from the old house
        updateFamilyHome = await this.familyHomeRepository.preload({
          id: dataFamilyHome.id,
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });

        //* We look to see if the preacher to be set is related to another house and we delete its relationships.
        const allFamilyHouses = await this.familyHomeRepository.find();
        const familyHomePreacher = allFamilyHouses.find(
          (home) => home.their_preacher?.id === preacher.id,
        );

        if (familyHomePreacher) {
          updateFamilyHomePreacher = await this.familyHomeRepository.preload({
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
      const allHouses = await this.familyHomeRepository.find();
      const allHousesByZone = allHouses.filter((home) => home.zone === zone);

      //* Find out if the co-stor and pastor match the area
      const familyHomeByCopastor = allHouses.find(
        (home) =>
          home.their_copastor?.id === copastor.id &&
          home.their_pastor?.id === pastor.id,
      );

      //* If there is no co-pastor and pastor in this zone, this co-pastor and pastor are set to this zone.
      if (familyHomeByCopastor === undefined && !zone) {
        numberHome = +dataFamilyHome.number_home;
        codeHome = dataFamilyHome.code;
        zoneHome = dataFamilyHome.zone;
      }

      if (
        familyHomeByCopastor &&
        !zone &&
        dataFamilyHome.zone !== familyHomeByCopastor.zone
      ) {
        throw new BadRequestException(
          `You cannot assign a copastor that governs the zone ${familyHomeByCopastor.zone} to the zone ${dataFamilyHome.zone}, if you want to merge the family_home you must submit the new zone`,
        );
      }

      //* If a co-pastor is found who already governs this zone, the same values ​​are set for this house with its new preacher and co-pastor from the same zone.
      //! Crashes validation if preacher ID is being used
      if (familyHomeByCopastor && !zone) {
        numberHome = +dataFamilyHome.number_home;
        codeHome = dataFamilyHome.code;
        zoneHome = dataFamilyHome.zone;
      }

      if (familyHomeByCopastor && zone && familyHomeByCopastor.zone !== zone) {
        throw new BadRequestException(
          `If you want to merge a family house to another zone, you must enter the correct zone according to the co-pastor`,
        );
      }

      //* Merging a house from one zone to another zone, the co-pastor and pastor are previously changed and the zone is sent to the DTO.
      if (
        familyHomeByCopastor &&
        familyHomeByCopastor.zone === zone &&
        dataFamilyHome.zone !== zone
      ) {
        numberHome = allHousesByZone.length + 1;
        codeHome = `${zone}-${numberHome}`;
        zoneHome = zone;
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
      (members) => members?.their_family_home?.id === dataFamilyHome.id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    //* Update or set the new preacher released to the family home, according to the condition.
    const familyHome = await this.familyHomeRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      code: codeHome,
      zone: zoneHome,
      number_home: numberHome?.toString(),
      is_active: is_active,
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //! Changes to Member-Preacher
    //* Removes the family_home from the previous member-preacher that will make the change (can be null).
    let updateOldFamilyHome: Member;
    if (dataFamilyHome.their_preacher) {
      updateOldFamilyHome = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        their_family_home: null,
      });
    }

    //* Find and eliminate the relationships of the new preacher to establish
    const familyHomeMember = allMembers.find(
      (member) => member.id === preacher.member.id,
    );

    let updateNewFamilyHome: Member;
    if (familyHomeMember) {
      updateNewFamilyHome = await this.memberRepository.preload({
        id: familyHomeMember.id,
        their_family_home: null,
      });
    }

    //* Set family home to pracher-member
    const updateMemberFamilyHome = await this.memberRepository.preload({
      id: preacher.member.id,
      their_family_home: familyHome,
    });

    //* Update, search all members with the same house and set the new preacher
    const arrayfamilyHomePreacher = allMembers.filter(
      (member) =>
        member?.their_family_home?.id === dataFamilyHome.id &&
        !member.roles.includes('preacher'),
    );

    //* Delete old data
    const promisesMemberHomeDelete = arrayfamilyHomePreacher.map(
      async (home) => {
        await this.memberRepository.update(home.id, {
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });
      },
    );

    //* Update new data
    const promisesMemberHomeUpdate = arrayfamilyHomePreacher.map(
      async (home) => {
        await this.memberRepository.update(home.id, {
          their_preacher: preacher,
          their_copastor: copastor,
          their_pastor: pastor,
        });
      },
    );
    try {
      updateFamilyHome &&
        (await this.familyHomeRepository.save(updateFamilyHome));
      updateFamilyHomePreacher &&
        (await this.familyHomeRepository.save(updateFamilyHomePreacher));
      await this.familyHomeRepository.save(familyHome);
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
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataFamilyHome = await this.familyHomeRepository.findOneBy({ id });

    if (!dataFamilyHome) {
      throw new NotFoundException(`Family Home with id: ${id} not exits`);
    }

    const familyHome = await this.familyHomeRepository.preload({
      id: dataFamilyHome.id,
      their_copastor: null,
      their_pastor: null,
      their_preacher: null,
      is_active: false,
    });

    //* Update and eliminate relations with their_family_home
    let member: Member;
    if (familyHome.their_copastor) {
      member = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        their_family_home: null,
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
      (member) => member.their_family_home?.id === dataFamilyHome.id,
    );

    const promisesMembers = membersByFamilyHome.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_family_home: null,
        their_copastor: null,
        their_pastor: null,
        their_preacher: null,
      });
    });

    try {
      await this.familyHomeRepository.save(familyHome);
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

  private searchFamilyHomeBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    type_of_name: string,
    repository: Repository<Member>,
  ): Promise<FamilyHome | FamilyHome[]> => {
    //! Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const familyHouses = await this.familyHomeRepository.find();

      let familyHomeByName: FamilyHome[][];

      if (type_of_name === 'preacher') {
        familyHomeByName = members.map((member) => {
          const newFamilyHouses = familyHouses.filter(
            (home) => home.their_preacher?.member?.id === member.id,
          );
          return newFamilyHouses;
        });
      }

      if (type_of_name === 'copastor') {
        familyHomeByName = members.map((member) => {
          const newFamilyHouses = familyHouses.filter(
            (home) => home.their_copastor?.member?.id === member.id,
          );
          return newFamilyHouses;
        });
      }

      if (!familyHomeByName) {
        throw new NotFoundException(
          `Not found Family Houses with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayFamilyHousesFlattened = familyHomeByName.flat();

      if (ArrayFamilyHousesFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Family Houses with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayFamilyHousesFlattened;
    }

    //! For find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const familyHouses = await this.familyHomeRepository.find();

      let familyHomeByName: FamilyHome[][];

      if (type_of_name === 'preacher') {
        familyHomeByName = members.map((member) => {
          const newFamilyHouses = familyHouses.filter(
            (home) => home.their_preacher?.member.id === member.id,
          );
          return newFamilyHouses;
        });
      }

      if (type_of_name === 'copastor') {
        familyHomeByName = members.map((member) => {
          const newFamilyHouses = familyHouses.filter(
            (home) => home.their_copastor?.member.id === member.id,
          );
          return newFamilyHouses;
        });
      }

      if (!familyHomeByName) {
        throw new NotFoundException(
          `Not found Family Houses with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }
      const ArrayFamilyHousesFlattened = familyHomeByName.flat();

      if (ArrayFamilyHousesFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Family Houses with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayFamilyHousesFlattened;
    }
  };

  //! DELETE FOR SEED
  async deleteAllFamilyHouses() {
    const query = this.familyHomeRepository.createQueryBuilder('houses');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
