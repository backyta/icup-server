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
        `Not faound CoPastor with id ${their_preacher}`,
      );
    }

    if (!preacher.is_active) {
      throw new BadRequestException(
        `The property is_active in Preacher must be a true value"`,
      );
    }

    //* Validation copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${preacher.their_copastor.id}`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Validation pastor
    const pastor = await this.pastorRepository.findOneBy({
      id: preacher.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Not faound Pastor with id ${preacher.their_pastor.id}`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //? Validation of zone assignment by copastor and preacher
    const allHouses = await this.familyHomeRepository.find();
    const allHousesByZone = allHouses.filter(
      (home) => home.zone === zone.toUpperCase(),
    );
    console.log(allHousesByZone);

    const dataFamilyHome = allHouses.find(
      (house) =>
        house.zone === zone.toUpperCase() ||
        house.their_copastor.id === copastor.id,
    );

    if (dataFamilyHome) {
      if (
        dataFamilyHome.their_copastor.id !== copastor.id ||
        dataFamilyHome.zone !== zone.toUpperCase()
      ) {
        throw new BadRequestException(
          `You cannot assign a preacher with a copastor different from the one already used for this zone: Zone-${dataFamilyHome.zone}, ${dataFamilyHome.their_copastor.member.first_name} ${dataFamilyHome.their_copastor.member.last_name}`,
        );
      }
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

    //NOTE : desde casa fdamiuliar setear el rpedicador cuando se crea la nueva casa, es decir en tabla predicador colocarle la casa que se esta vinculando (ver)
    //NOTE : no seria necesario porque se setea cunado se hace la busqueda por ID, aunque se puede agregar si es necesarrio
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
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let familyHome: FamilyHome | FamilyHome[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      familyHome = await this.familyHomeRepository.findOneBy({ id: term });

      if (!familyHome) {
        throw new BadRequestException(`FamilyHome was not found with this UUI`);
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
        throw new BadRequestException(
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
        throw new BadRequestException(
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
        throw new BadRequestException(
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
        throw new BadRequestException(
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
        throw new BadRequestException(
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

    return familyHome;
  }

  //* UPDATE FAMILY HOME ID
  async update(id: string, updateFamilyHomeDto: UpdateFamilyHomeDto) {
    const { their_preacher, is_active, zone } = updateFamilyHomeDto;

    if (is_active === undefined) {
      throw new BadRequestException(
        `You must assign a boolean value to is_Active`,
      );
    }

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
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not found CoPastor with id ${preacher.their_copastor.id}, his_copastor is missing in Preacher`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Pastor assignment and validation
    const pastor = await this.pastorRepository.findOneBy({
      id: preacher.their_pastor.id,
    });

    if (!pastor) {
      throw new NotFoundException(
        `Not found Pastor with id ${preacher.their_pastor.id}, his_pastor is missing in Preacher`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //! If there is data in their_copastor and their_pastor
    let updateFamilyHome: FamilyHome;
    let updateFamilyHomePreacher: FamilyHome;
    if (
      dataFamilyHome.their_copastor !== null &&
      dataFamilyHome.their_pastor !== null
    ) {
      //? If you want to update a preacher with a different copastor to the area
      if (
        dataFamilyHome.their_copastor.id !== copastor.id ||
        dataFamilyHome.zone !== zone
      ) {
        throw new BadRequestException(
          `A preacher cannot be assigned with a copastor or zone different from the one already used for this zone: Zone-${dataFamilyHome.zone}, ${dataFamilyHome.their_copastor.member.first_name} ${dataFamilyHome.their_copastor.member.last_name}, first co-pastor must be changed in the Preacher entity`,
        );
      }

      //? If a preacher is updated with a copastor equal to that of the zone, your relationships are deleted and new ones are established
      if (
        dataFamilyHome.their_copastor.id === copastor.id &&
        dataFamilyHome.zone === zone
      ) {
        //! Delete relationships from the Family Home to update
        updateFamilyHome = await this.familyHomeRepository.preload({
          id: dataFamilyHome.id,
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });

        //! Search if the new preacher to be set has a related family home and delete relationships.
        const allFamilyHouses = await this.familyHomeRepository.find();
        const familyHomePreacher = allFamilyHouses.find(
          (home) => home.their_preacher.id === preacher.id,
        );

        //NOTE : revisar si hay error aqu, aunque no deberia
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

    //! If there is missing data in their_copastor and their_pastor
    let numberHome: number;
    let codeHome: string;

    if (
      dataFamilyHome.their_copastor === null ||
      dataFamilyHome.their_pastor === null
    ) {
      const allHouses = await this.familyHomeRepository.find();

      //! Puede ser null
      const familyHomeByCopastor = allHouses.find(
        (home) => home.their_copastor.id === copastor.id,
      );

      const allHousesByZone = allHouses.filter((home) => home.zone === zone);

      //? The preacher is set up with his co-pastor (new) to replace an entire area, the same code and correlative are maintained.
      if (familyHomeByCopastor.zone !== zone) {
        throw new BadRequestException(
          `You cannot assign a zone ${zone} to a zone ${familyHomeByCopastor.zone}, the same zone must be maintained`,
        );
      }

      //? Here we want to move the houses to another area, following the correlation of that area, and its same co-pastor
      if (familyHomeByCopastor !== undefined) {
        if (familyHomeByCopastor.zone !== zone) {
          throw new BadRequestException(
            `Cannot assign a zone ${zone} to a zone ${familyHomeByCopastor.zone}`,
          );
        }

        if (familyHomeByCopastor.zone === zone) {
          numberHome = allHousesByZone.length + 1;
          codeHome = `${zone}-${numberHome}`;
        }
      }
    }

    //NOTE : no seria necesario revisar porque, ya se hace en el buscar por ID
    //* Counting and assigning the number of members (id-familyHome member table)
    const allMembers = await this.memberRepository.find();
    const membersFamilyHome = allMembers.filter(
      (members) => members.their_family_home.id === id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    //? Update or set the new preacher released to the family home
    const familyHome = await this.familyHomeRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      code: codeHome,
      zone: zone,
      number_home: numberHome.toString(),
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //! Delete their_home from the previous preacher and set it to the new one.
    const updateOldFamilyHome = await this.memberRepository.preload({
      id: dataFamilyHome.their_preacher.member.id,
      their_family_home: null,
      their_preacher: null,
      their_copastor: null,
      their_pastor: null,
    });

    //! Search if the new preacher to be set has a related family home and delete relationships.
    const familyHomeMember = allMembers.find(
      (member) => member.their_preacher.id === preacher.id,
    );

    let updateNewFamilyHome: Member;
    if (familyHomeMember) {
      updateNewFamilyHome = await this.memberRepository.preload({
        id: familyHomeMember.id,
        their_family_home: null,
        their_preacher: null,
        their_copastor: null,
        their_pastor: null,
      });
    }

    //? Set the new preacher to the family home to update, in module Member (If it is null or the relationships were deleted)
    const updateMemberFamilyHome = await this.memberRepository.preload({
      id: preacher.member.id,
      their_family_home: familyHome,
      their_preacher: null,
      their_copastor: copastor,
      their_pastor: pastor,
    });

    //! Search all members with the same house and set the new preacher
    const arrayfamilyHomePreacher = allMembers.filter(
      (member) =>
        member.their_family_home.id === dataFamilyHome.id &&
        !member.roles.includes('preacher'),
    );

    //? Delete and Set new relationships (preacher, pastor, co-pastor) to each member of the updated Family House.
    const promisesMemberHomeDelete = arrayfamilyHomePreacher.map(
      async (home) => {
        await this.memberRepository.update(home.id, {
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });
      },
    );

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
      //NOTE : revisar esto si se setea tmb en member
      await this.familyHomeRepository.save(updateFamilyHome);
      await this.familyHomeRepository.save(updateFamilyHomePreacher);
      await this.familyHomeRepository.save(familyHome);
      await this.memberRepository.save(updateOldFamilyHome);
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

    //? Update and eliminate relations with their_family_home
    const member = await this.memberRepository.preload({
      id: dataFamilyHome.their_preacher.member.id,
      their_family_home: null,
    });

    //? Update and set to null in Member, all those who have the same Family Home
    const allMembers = await this.memberRepository.find();
    const membersByFamilyHome = allMembers.filter(
      (member) =>
        member.their_family_home.id === dataFamilyHome.id &&
        !member.roles.includes('preacher'),
    );

    //! Revisar, si despues puedo setear desde preacher nuevo copastor y en casa jalar ese preacher con nueva data y ponerlo en Member.
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
      await this.memberRepository.save(member);
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
}
