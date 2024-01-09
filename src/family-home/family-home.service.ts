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

  //TODO : documentar y trasnformar todo lo demas a ingles, revisar archivos rutas relativas y hacer merge

  //* UPDATE FAMILY HOME ID
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
        dataFamilyHome.zone !== zone
      ) {
        throw new BadRequestException(
          `A preacher cannot be assigned with a copastor or zone different from the one already used for this zone: Zone-${dataFamilyHome.zone}, ${dataFamilyHome.their_copastor.member.first_name} ${dataFamilyHome.their_copastor.member.last_name}, first co-pastor must be changed in the Preacher entity`,
        );
      }

      //* Colocar un nuevo preacher a la casa familiar debe ser de la misma zone, se borra las relaciones
      if (
        dataFamilyHome.their_copastor.id === copastor.id &&
        dataFamilyHome.zone === zone
      ) {
        //* Borrar las relaciones de la casa vieja
        updateFamilyHome = await this.familyHomeRepository.preload({
          id: dataFamilyHome.id,
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });

        //* Buscamos si el preacher a setear esta relacionado a otra casa y borramos sus relaciones
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
      const allHouses = await this.familyHomeRepository.find();
      const allHousesByZone = allHouses.filter((home) => home.zone === zone);

      //* Buscar si coincide el copastor con la zona
      const familyHomeByCopastor = allHouses.find(
        (home) => home.their_copastor?.id === copastor.id,
      );

      // TODO : probar esto maniana nuevamente, pasar todo al ingles y hacer el merge
      if (
        (familyHomeByCopastor === undefined || familyHomeByCopastor) &&
        zone
      ) {
        throw new BadRequestException(
          `No es necesario colocar la zone, se esta seteando un copastor para esta zone o un preacher con una zona ya establecida`,
        );
      }

      //* Si no se encuentra copastor en esta zona, y no hay zone en el DTO se setea a este copastor a esta zona.
      if (familyHomeByCopastor === undefined && !zone) {
        numberHome = +dataFamilyHome.number_home;
        codeHome = dataFamilyHome.code;
        zoneHome = dataFamilyHome.zone;
      }

      //* Si se encuentra copastor para esta zona, no se envia zone en DTO, se setea los mismos valores para esta casa con su nuevo predicador y copastor de la misma zona.
      if (familyHomeByCopastor && !zone) {
        numberHome = +familyHomeByCopastor.number_home;
        codeHome = familyHomeByCopastor.code;
        zoneHome = familyHomeByCopastor.zone;
      }

      //* Fusionar una casa de una zona a otra zona, previamente se cambia el copastor y se manda la zona en el DTO
      if (
        familyHomeByCopastor &&
        familyHomeByCopastor.zone === zone &&
        dataFamilyHome.zone !== zone
      ) {
        numberHome = allHousesByZone.length + 1;
        codeHome = `${zone}-${numberHome}`;
        zoneHome = zone;
      }

      if (
        familyHomeByCopastor &&
        zone &&
        familyHomeByCopastor.zone !== zone &&
        dataFamilyHome.zone === zone
      ) {
        throw new BadRequestException(
          `Si se quiere fusionar una casa familiar a otra zona, se debe colocar la zone correcta segun el copastor`,
        );
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

    //* Update or set the new preacher released to the family home, according to the condition
    const familyHome = await this.familyHomeRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      code: codeHome,
      zone: zoneHome,
      is_active: is_active,
      number_home: numberHome.toString(),
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //* Elimina la family home del anterior casa que se hara el cambio de preacher (puede ser null).
    let updateOldFamilyHome: Member;
    if (dataFamilyHome.their_preacher) {
      updateOldFamilyHome = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        their_family_home: null,
      });
    }

    //* Buscar y eliminar las relaciones del nuevo predicador a establecer
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

    //* Establecer casa familiar al pracher-member
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

    //? Update and eliminate relations with their_family_home
    let member: Member;
    if (familyHome.their_copastor) {
      member = await this.memberRepository.preload({
        id: dataFamilyHome?.their_preacher?.member?.id,
        their_family_home: null,
      });
    }

    //? Update and set to null in Member, all those who have the same Family Home
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
}
