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

    //? Validacion de asignacion de zona por copastor y preacher
    const allHouses = await this.familyHomeRepository.find();
    const allHousesByZone = allHouses.filter((home) => home.zone === zone);
    // const allHousesZoneA = allHouses.filter((home) => home.zone === 'A');
    // const allHousesZoneB = allHouses.filter((home) => home.zone === 'B');
    // const allHousesZoneC = allHouses.filter((home) => home.zone === 'C');

    let numberHome: number;
    let codeHome: string;

    if (allHousesByZone.length === 0) {
      numberHome = 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (allHousesByZone.length !== 0) {
      numberHome = 1;
      codeHome = `${zone}-${numberHome}`;
    }

    //?

    // if (zone === 'A' && allHousesZoneA.length === 0) {
    //   numberHome = 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    // if (zone === 'A' && allHousesZoneA.length !== 0) {
    //   numberHome = allHousesZoneA.length + 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    // if (zone === 'B' && allHousesZoneB.length === 0) {
    //   numberHome = 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    // if (zone === 'B' && allHousesZoneB.length !== 0) {
    //   numberHome = allHousesZoneB.length + 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    // if (zone === 'C' && allHousesZoneC.length === 0) {
    //   numberHome = 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    // if (zone === 'C' && allHousesZoneC.length !== 0) {
    //   numberHome = allHousesZoneC.length + 1;
    //   codeHome = `${zone}-${numberHome}`;
    // }

    const dataFamilyHomeZoneA = await this.familyHomeRepository.findOneBy({
      zone: 'A',
    });
    const dataFamilyHomeZoneB = await this.familyHomeRepository.findOneBy({
      zone: 'B',
    });
    const dataFamilyHomeZoneC = await this.familyHomeRepository.findOneBy({
      zone: 'C',
    });

    //TODO l terminar esto towmorrow, no es necesario poner en duro la A B C
    //* Hacer uan sola consulta y luego dentro del iff colocar o comparar con zona A Bo C o hacer barrido
    //! Y finalmente porbar esto y el actualizar y documentar
    //! La zona A no puede tener el mismo copastor que la zona B
    if (dataFamilyHomeZoneA !== null) {
      if (
        zone === 'A' &&
        dataFamilyHomeZoneA.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `No se puede asignar un preacher con un copastor diferente al ya registrado para esta zona: ${dataFamilyHomeZoneA.their_copastor.member.first_name} ${dataFamilyHomeZoneA.their_copastor.member.last_name}`,
        );
      }
    }

    if (dataFamilyHomeZoneB !== null) {
      if (
        zone === 'B' &&
        dataFamilyHomeZoneB.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `No se puede asignar un preacher con un copastor diferente al ya registrado para esta zona: ${dataFamilyHomeZoneB.their_copastor.member.first_name} ${dataFamilyHomeZoneB.their_copastor.member.last_name}`,
        );
      }
    }
    if (dataFamilyHomeZoneC !== null) {
      if (
        zone === 'C' &&
        dataFamilyHomeZoneC.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `No se puede asignar un preacher con un copastor diferente al ya registrado para esta zona: ${dataFamilyHomeZoneC.their_copastor.member.first_name} ${dataFamilyHomeZoneC.their_copastor.member.last_name}`,
        );
      }
    }

    //* Create instance
    try {
      const familyHomeInstance = this.familyHomeRepository.create({
        ...createFamilyHomeDto,
        number_home: numberHome.toString(),
        zone: zone,
        code: codeHome,
        their_preacher: preacher,
        their_pastor: pastor,
        their_copastor: copastor,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      const result = await this.familyHomeRepository.save(familyHomeInstance);

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
      const allMembers = await this.memberRepository.find();
      const membersFamilyHome = allMembers.filter(
        (members) => members.their_family_home.id === term,
      );

      const listMembersId = membersFamilyHome.map((member) => member.id);

      familyHome.count_members = membersFamilyHome.length;
      familyHome.members = listMembersId;

      await this.familyHomeRepository.save(familyHome);
    }

    //* Find Code --> One
    if (term && type === SearchType.code) {
      familyHome = await this.familyHomeRepository.findOneBy({
        code: term,
        is_active: true,
      });

      if (!familyHome) {
        throw new BadRequestException(
          `FamilyHome was not found with this code ${term}`,
        );
      }
    }

    //* Find Zone --> Many
    if (term && type === SearchType.zone) {
      familyHome = await this.familyHomeRepository
        .createQueryBuilder('fh')
        .where('fh.zone LIKE :term', { term: `%${term}%` })
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

    //* Find Address --> Many
    if (term && type === SearchType.address) {
      familyHome = await this.familyHomeRepository
        .createQueryBuilder('fh')
        .where('fh.address LIKE :term', { term: `%${term}%` })
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
        .andWhere('fh.is_active = :isActive', { isActive: true })
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
        .where('fh.their_copastor = :term', { term })
        .andWhere('fh.is_active = :isActive', { isActive: true })
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
        });

        if (familyHouses.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }
        return familyHouses;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
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

  //TODO : hacer documentacion tomorrow(20/12)
  //* Crear por orden las casas o por antiguedad para que tengan un correlativo.

  //* Si en un futuro la zona A y B se juntan se toma la zona B y se empieza a actualizar a zona A
  //* Y deberia hacer la misma validaciond e registros y asignar el proximo correlativo.

  //! Hacer misma validacion, pero como el copastor estara en null, del predicador, lanzar advertencia que primero se debe
  //! asignar un copastor al predicador, y despues hacer la seleccion si es Zona B pasar sa casa con nuevo correlativo

  //! Si elimino la al copastor y dejo huerfanos las casas, pero creo otro copastor, con un pastor relacionado, y el preacger
  //! actualizo a mis preacher huerfanos con ese nuevo copastor, al actualiza en casa familiar ....
  //TODO : seguir esta descripcion

  //NOTE : desde el front colocar select con Zona A B C

  //TODO : hay un problema y es que estoy referenciando al copastor a una zona y no deberia ser asi porque las
  //TODO : zonas pueden cambiar de copastor. (Corregir y revisar, y aplicar lo de abajo), se tendria que digitar manual?

  //! Se puede colocar inactivo la casa, pero luego se puede activar con nueva direccion, manteniendo el mismo codigo y nombre
  //! Se puede actualizar directamente si se consigue una casa inmediata, la direccion, y el code y name se mantiene.
  //! Nunca se quitaria el codigo si no que se coloca solo inactivo, solo se quita las relaciones.
  //! Los miembros que quedan sueltos junto con supredicador pueden congregar o ser actualizados y seteados en otra casa.
  //? Atencion
  //! Al actualizar se coloca el preacher y este debe jalar a su copastor y pastor.
  //! Se debe asignar un predicador dentro de la zona del copastor (A, B o C)
  //! Mostrar los predicadores disponbles a cambiar segun el copastor relacionado.

  //! Si se desea cambiar otro predicador de otra zona, este predicador primero debe ser actualizado su copastor.
  //! Por ejemplo el predicador Brian de la zona Mercedes, se actualiza a Luz y recien aparece para asignarse a una casa de la zona de Luz (A)
  //NOTE: Hacer condicion si el copastor esta en null no se puede actualizar PRIMERO SE DEBE ACTUALIZAR EN PREACHER

  //* Poner aleta de que no se podra cambiar a un pracher a la casa familiar si es que no esta dentro de la zona de Copastor,
  //* antes debera cambiar su copastor
  //? Filtrar al querer actualizar el preacher de la casa, solo los que esten segun esa zona.

  //! Hay 2 casos, primero si se cambia de preacher, este debe ser dentro de la zona del copastor, filtrar los que tienen
  //! mismo copastor(FRONT), y tirar error si manda un preacher con otro copastor.
  //NOTE: se toma del id copastor y en preacher se filtra por todos los que tienen este copastor, y ahi seria la misma Zona

  //! Segundo si se ha eliminado el copastor, y esta en null en todos lados, tirar error si se quiere actualizar un pracher
  //! con null en copastor, decir que primero se atualize el preacher su copastor.

  //! Tercero tener la misma validacion que crear para que si es zona A y su copastor es diferente, lanzar error.
  //! Si cambio todos los preacher a zona B, entonces podre actualizar o apareceran desde el front los preacher de zona B
  //NOTE : desde el front hacer una consulta por zona y de este resultado buscar por copastor sus preacger, osea si coloca zona A, aparecen todos los preacher referidos a esete copastor. y puedo seleccionar

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

    //* Validation copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: preacher.their_copastor.id,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not found CoPastor with id ${preacher.their_copastor.id}, possible null value`,
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
        `Not faound Pastor with id ${preacher.their_pastor.id}, possible null value`,
      );
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //NOTE: recordar que siempre antes se debe actualizar en las relaciones anteriores en este caso Preacher su pastor y copastor.
    //* Cuando se quiera cambiar a otro preacher que no esta en la zona del Copastor (validacion)
    if (
      dataFamilyHome.their_copastor !== null &&
      dataFamilyHome.their_pastor !== null
    ) {
      if (dataFamilyHome.their_copastor.id !== copastor.id) {
        throw new BadRequestException(
          `No se puede asignar un preacher con un copastor diferente al ya registrado para esta zona: Zona-${dataFamilyHome.zone}, ${dataFamilyHome.their_copastor.member.first_name} ${dataFamilyHome.their_copastor.member.last_name}, primero se debe cambiar copastor en la entidad Preacher`,
        );
      }
    }

    //* Si una Casa o varias pasan a otra zona con otro Preacher y Copastor relacionado a este.
    //* O si se actualiza a otra zona nueva, se crea desde un comienzo los codes para las coasa.
    let numberHome: number;
    let codeHome: string;

    if (
      (dataFamilyHome.their_copastor === null ||
        dataFamilyHome.their_pastor === null) &&
      dataFamilyHome.zone !== zone
    ) {
      const allHouses = await this.familyHomeRepository.find();
      const familyHomeByCopastor = allHouses.find(
        (home) => home.their_copastor.id === copastor.id,
      );

      //! Hacer validacion por undfined, debemos crear con nuevo zone y code.
      if (familyHomeByCopastor === undefined) {
        numberHome = 1;
        codeHome = `${zone}-${numberHome}`;
      }

      if (familyHomeByCopastor.zone !== zone) {
        throw new BadRequestException(
          `No se puede asignar una zone ${zone} a una zone ${dataFamilyHome.zone}`,
        );
      }

      const allHousesByZone = allHouses.filter((home) => home.zone === zone);

      if (zone === familyHomeByCopastor.zone) {
        numberHome = allHousesByZone.length + 1;
        codeHome = `${zone}-${numberHome}`;
      }
    }

    //NOTE : no seria necesario revisar porque, ya se hace en el buscar por ID
    //* Counting and assigning the number of members (id-familyHome member table)
    const allMembers = await this.memberRepository.find();
    const membersFamilyHome = allMembers.filter(
      (members) => members.their_family_home.id === id,
    );

    const listMembersId = membersFamilyHome.map((member) => member.id);

    const familyHome = await this.familyHomeRepository.preload({
      id: id,
      ...updateFamilyHomeDto,
      their_pastor: pastor,
      their_copastor: copastor,
      their_preacher: preacher,
      code: codeHome,
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //! Eliminar el their_home al preacher anterior y setearlo al nuevo.
    const deleteMemberPreacherFamilyHome = await this.memberRepository.preload({
      id: dataFamilyHome.their_preacher.member.id,
      their_family_home: null,
    });

    const updateMemberPreacherFamilyHome = await this.memberRepository.preload({
      id: preacher.member.id,
      their_family_home: familyHome,
    });

    try {
      //NOTE : revisar esto si se setea tmb en member
      await this.familyHomeRepository.save(familyHome);
      await this.memberRepository.save(deleteMemberPreacherFamilyHome);
      await this.memberRepository.save(updateMemberPreacherFamilyHome);
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

    //? Update and set to null in Member, all those who have the same Family Home
    const allMembers = await this.memberRepository.find();
    const membersByFamilyHome = allMembers.filter(
      (member) => member.their_family_home.id === familyHome.id,
    );

    const promisesMembers = membersByFamilyHome.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_family_home: null,
      });
    });

    try {
      await this.familyHomeRepository.save(familyHome);
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
