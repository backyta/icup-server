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

    //! Deberia haber 3 casos,
    //! El primero que se actualiza una family home de is active false a true, y se debe setear
    //! un nuevo preacher, solo se setea en casa familiar (luego en search se setea en preacher, el id de su casa)
    //! Al setear esto, al elegit una casa para un miembro, este jalara todas las demas relaciones.
    //! Setear en Member-Preacher su casa familiar, segun el rpeacher que elegimos aca y ponerlo como activo
    //! El preacher debe guardar relacion con la zona de su copastor de esta casa,
    //! Y en members personales se elegiria la casa.

    //? El segundo seria colocar un nuevo preacher a la casa siempre y cuando sea el mismo copastor y zona, aqui se deberia
    //? eliminar el preacher de la otra casa(misma zona) y pasarlo a esta nueva casa.
    //? Si se quiere cambiar un predicador a otra casa de otra zona primero se debe actualizar su copastor.

    //* El tercero seria la fusion de casas a otra zona, se debe verificar su zona nueva, y su copastor que se quieren
    //* setear para que acepte el cambioo fusion de la casa a la zona, por ejemplo si es casa A-1, y se coloca zona B
    //* el copastor debe pertenecer a la zona B, para hacer el cambio y aumento de casa +1

    //! If there is data in their_copastor and their_pastor
    let updateFamilyHome: FamilyHome;
    let updateFamilyHomePreacher: FamilyHome;
    if (
      dataFamilyHome.their_preacher !== null &&
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

      //! Colocar un nuevo preacher a la casa familiar de la misma zona deben ser, se borra las relaciones para setear
      //! el preacher a la casa
      if (
        dataFamilyHome.their_copastor.id === copastor.id &&
        dataFamilyHome.zone === zone
      ) {
        //* Borrar todo del antiguo
        updateFamilyHome = await this.familyHomeRepository.preload({
          id: dataFamilyHome.id,
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });

        //* Borrar todo del nuevo, para poder setearlo mas adealnte su nueva data
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

      //* Fusionar una casa de una zona a otra zona, previamente se cambia el copastor y se manda la zona en el DTO
      //* Primero se debe cambiar en preacher el copastor, osea rebota en la validacion, esto es cuando hay data en
      //* pastor y copastor
      //! Cuando se cambia el copastor de preacher se setea a null en casa familiar(Revisar y probar endpoiut)
    }

    //* Pasar a is_active true y setear el nuevo pracher, copastor y pastor
    //! If there is missing data in their_copastor and their_pastor
    let numberHome: number;
    let codeHome: string;
    let zoneHome: string;

    //! Aca es para pasar a is active en true, y tmb para setear un nuevo copastor a esa zona , si se ha eliminado el copastor
    //! Tmb si encuentra un copastor con la misma zona, se respeta su codigo y se setea el predicador a esa casa, que tenga el mismo copastor zona
    //! Tmb fusionar la zona, ya que al cambiar de copastor se setea a null, en preacher, la family home

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

      //* Si no se encuentra copastor en esta zona, y no hay zone en el DTO se setea a este copastor a esta zona,
      //* con su mismo zona y codigo.
      if (familyHomeByCopastor === undefined) {
        numberHome = +familyHomeByCopastor.number_home;
        codeHome = familyHomeByCopastor.code;
        zoneHome = familyHomeByCopastor.zone;
      }

      //* Si se encuentra copastor para esta zona, no se envia zone, se setea los mismos valores para esta casa
      //* con su nuevo predicador y copastor de la misma zona.
      if (familyHomeByCopastor) {
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

      //* La casa ya tiene la zona solo validar el copastor
      //! Pedi solo zona cuando se vaya a fusionar
      // if (familyHomeByCopastor.zone !== zone) {
      //   throw new BadRequestException(
      //     `You cannot assign a zone ${zone} to a zone ${familyHomeByCopastor.zone}, the same zone must be maintained`,
      //   );
      // }

      // if (familyHomeByCopastor !== undefined) {
      //   if (familyHomeByCopastor.zone !== zone) {
      //     throw new BadRequestException(
      //       `Cannot assign a zone ${zone} to a zone ${familyHomeByCopastor.zone}`,
      //     );
      //   }

      //   if (familyHomeByCopastor.zone === zone) {
      //     numberHome = allHousesByZone.length + 1;
      //     codeHome = `${zone}-${numberHome}`;
      //   }
      // }
    }

    //* Counting and assigning the number of members (id-familyHome member table)
    const allMembers = await this.memberRepository.find();
    const membersFamilyHome = allMembers.filter(
      (members) => members.their_family_home.id === id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    //! Seteo de cambios en Family Home, segun los 3 casos (se debe procesar todos en los if)
    //? Update or set the new preacher released to the family home
    //* Aca se setean dependiendo de la condicion, setea los nuevos valores en casa familiar
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

    // TODO : continuar Aqui y terminar y revisar Preacher y Family Home para testear endpoints
    //* Esto de aqui para que serviria?.....

    //! Delete their_home from the previous preacher and set it to the new one.
    const updateOldFamilyHome = await this.memberRepository.preload({
      id: dataFamilyHome.their_preacher?.member.id,
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
