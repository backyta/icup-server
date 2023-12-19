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
  //TODO : HACER logica para asignar el codigo de casa, y si se elimina la casa eliminar el codigo
  //* CREATE FAMILY HOME
  async create(createFamilyHomeDto: CreateFamilyHomeDto) {
    const { their_preacher } = createFamilyHomeDto;

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

    //? Asignacion de Zonas por Copastor, codigo y numero de casa.
    const allCopastores = await this.coPastorRepository.find();

    const CopastorZoneA = allCopastores.find((copastor) =>
      copastor.member.first_name.includes('Luz'),
    );
    const CopastorZoneB = allCopastores.find((copastor) =>
      copastor.member.first_name.includes('Mercedes'),
    );
    const CopastorZoneC = allCopastores.find((copastor) =>
      copastor.member.first_name.includes('Rosario'),
    );

    let zone: string;
    if (copastor.id === CopastorZoneA.id) {
      zone = 'A';
    }

    if (copastor.id === CopastorZoneB.id) {
      zone = 'B';
    }

    if (copastor.id === CopastorZoneC.id) {
      zone = 'C';
    }

    const allHouses = await this.familyHomeRepository.find();
    const allHousesZoneA = allHouses.filter((home) => home.zone === 'A');
    const allHousesZoneB = allHouses.filter((home) => home.zone === 'B');
    const allHousesZoneC = allHouses.filter((home) => home.zone === 'C');

    let numberHome: number;
    let codeHome: string;

    if (zone === 'A' && allHousesZoneA.length === 0) {
      numberHome = 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (zone === 'A' && allHousesZoneA.length !== 0) {
      numberHome = allHousesZoneA.length + 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (zone === 'B' && allHousesZoneB.length === 0) {
      numberHome = 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (zone === 'B' && allHousesZoneB.length !== 0) {
      numberHome = allHousesZoneB.length + 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (zone === 'C' && allHousesZoneC.length === 0) {
      numberHome = 1;
      codeHome = `${zone}-${numberHome}`;
    }

    if (zone === 'C' && allHousesZoneC.length !== 0) {
      numberHome = allHousesZoneC.length + 1;
      codeHome = `${zone}-${numberHome}`;
    }

    //TODO : revisar y seguir en esto tomorrow 19/12 (Revisar wasap)
    //TODO : hay un problema y es que estoy referenciando al copastor a una zona y no deberia ser asi porque las
    //TODO : zonas pueden cambiar de copastor. (Corregir y revisar, y aplicar lo de abajo)
    //! Se puede colocar inactivo la casa, pero luego se puede activar con nueva direccion, manteniendo el mismo codigo y nombre
    //! Se puede actualizar directamente si se consigue una casa inmediata, la direccion, y el code y name se mantiene.
    //! Nunca se quitaria el codigo si no que se coloca solo inactivo
    //? Atencion
    //! Al actualizar se coloca el preacher y este debe jalar a su copastor y pastor.
    //! Se debe asignar un predicador dentro de la zona del copastor (A, B o C)
    //! Mostrar los predicadores disponbles a cambiar segun el copastor relacionado.

    //! Si se desea cambiar otro predicador de otra zona, este predicador primero debe ser actualizado su copastor.
    //! Por ejemplo el predicador Brian de la zona Mercedes, se actualiza a Luz y recien aparece para asignarse a una casa de la zona de Luz (A)

    //* Poner aleta de que no se podra cambiar a un pracher a la casa familiar si es que no esta dentro de la zona de Copastor,
    //* antes debera cambiar su copastor
    //? Filtrar al querer actualizar el preacher de la casa, solo los que esten segun esa zona.

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

      //NOTE : ver si funciona esto... o si no hacerlo manual, en cada miembro preacher agregarle su Residencia, auqnue deberia funcionar aqui opara que sea directo el seteo.
      const updateMemberTheirFamilyHome = await this.memberRepository.preload({
        id: preacher.member.id,
        their_family_home: familyHomeInstance,
      });

      await this.memberRepository.save(updateMemberTheirFamilyHome);
      return await this.familyHomeRepository.save(familyHomeInstance);
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
      relations: ['their_preacher', 'their_copastor', 'their_pastor'],
    });
    //NOTE : Revisar si se cargan las relaciones o afecta, para cargarlas aqui (falta el eager o si no cargarlas aqui.)
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
        throw new BadRequestException(
          `No se encontro FamilyHome con este UUID`,
        );
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
          `No se encontro FamilyHome con este code ${term}`,
        );
      }
    }

    //* Find Address --> One
    if (term && type === SearchType.address) {
      familyHome = await this.familyHomeRepository
        .createQueryBuilder('fh')
        .where('fh.address LIKE :term', { term: `%${term}%` })
        .andWhere('fh.is_active = :isActive', { isActive: true })
        .getOne();

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro una FamilyHome con este address : ${term} `,
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
          `No se encontro una FamilyHome con este their_preacher : ${term} `,
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
          `No se encontro ninguna FamilyHome con este their_copastor : ${term} `,
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

  //* UPDATE FAMILY HOME ID
  async update(id: string, updateFamilyHomeDto: UpdateFamilyHomeDto) {
    const { their_preacher, is_active } = updateFamilyHomeDto;

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
      members: listMembersId,
      count_members: listMembersId.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    const updateMemberPreacher = await this.memberRepository.preload({
      id: preacher.member.id,
      their_family_home: familyHome,
    });

    try {
      await this.familyHomeRepository.save(familyHome);
      await this.memberRepository.save(updateMemberPreacher);
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
