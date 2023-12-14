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
import { Pastor } from '../pastor/entities/pastor.entity';
import { Member } from '../members/entities/member.entity';

import { CoPastor } from './entities/copastor.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { updateAge, searchPerson, searchFullname } from '../common/helpers';
import { SearchType } from '../common/enums/search-types.enum';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import { FamilyHome } from 'src/family-home/entities/family-home.entity';
//TODO : Hacer documentacion y conversion al ingles, apuntar coasas importantes para otros modululos()
@Injectable()
export class CoPastorService {
  private readonly logger = new Logger('CoPastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHome)
    private readonly familyHomeRepository: Repository<FamilyHome>,

    //NOTE : en un futuro se puede agregar supervisores al pastor y copastor y toda la jerarquia que tenga
  ) {}

  //* CREATE COPASTOR
  async create(createCoPastorDto: CreateCoPastorDto): Promise<CoPastor> {
    const { id_member, their_pastor } = createCoPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: id_member,
    });

    if (!member) {
      throw new NotFoundException(`Not found Member with id ${id_member}`);
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Pastor"`,
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

    //* Asignacion de instancia
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      their_pastor: pastor,
    });

    try {
      const coPastorInstance = this.coPastorRepository.create({
        member: member,
        their_pastor: pastor,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      await this.memberRepository.save(dataMember);
      return await this.coPastorRepository.save(coPastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.coPastorRepository.find({
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
    let coPastor: CoPastor | CoPastor[];

    //* Find ID --> One (ID por activo o inactivo)
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.coPastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new BadRequestException(`No se encontro Copastor con este UUID`);
      }

      //* Conteo y asignacion de Casas
      const familyHouses = await this.familyHomeRepository.find();
      const listFamilyHouses = familyHouses.filter(
        (home) => home.their_copastor.id === term,
      );

      const familyHousesId = listFamilyHouses.map((houses) => houses.id);

      //* Conteo y asignacion de Preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.their_copastor.id === term,
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
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find fullName --> One
    if (term && type === SearchType.fullName) {
      const resultSearch = await this.searchCoPastorBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        this.memberRepository,
      );

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
        });

        if (coPastores.length === 0) {
          throw new NotFoundException(
            `Not found coPastores with these names: ${term}`,
          );
        }
        return coPastores;
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

    if (!coPastor)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return coPastor;
  }

  //! En el front cuando se actualize colocar desactivado el rol, y que se mantenga en pastor, copastor,
  //! o preacher, solo se hara la subida de nivel desde el member. (ESTO SI),
  //! solo subir de nivel desde el member.
  //! Agregar un apartado que diga promover al mimbro de copastor a Pastor, con una alerta que diga que talos
  //! cosas sucederan si se promueve.
  //TODO : Si un copastor actualiza y cambia de pastor, esto deberia verse afectado donde todos tengan a este copastor.
  //TODO : aqui tmb no se podra cambiar el id_member, sacarlo del mismo Copastor, modificar DTO de actualizar.

  //* UPDATE FOR ID
  async update(id: string, updateCoPastorDto: UpdateCoPastorDto) {
    const { their_pastor, is_active } = updateCoPastorDto;

    if (is_active === undefined) {
      throw new BadRequestException(
        `Debe asignar un valor booleano a is_Active`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor not found with id: ${id}`);
    }

    //* Asignacion y validacion de Member
    const member = await this.memberRepository.findOneBy({
      id: dataCoPastor.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataCoPastor.member.id}`,
      );
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `No se puede asignar este miembro como Copastor, falta rol: ['copastor']`,
      );
    }

    //* Asignacion y validacion de pastor
    const pastor = await this.pastorRepository.findOneBy({
      id: their_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    //? Actualizar en todos los miembros el nuevo pastor del copastor que se actualiza.
    const allMembers = await this.memberRepository.find();
    const membersByCoPastor = allMembers.filter(
      (member) => member.their_copastor.id === dataCoPastor.id,
    );

    const promisesMembers = membersByCoPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_pastor: pastor,
      });
    });

    //? Actualizar en todos los preachers el nuevo pastor del copastor que se actualiza.
    const allPreachers = await this.preacherRepository.find();
    const preachersByCoPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor.id === dataCoPastor.id,
    );

    const promisesPreacher = preachersByCoPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_pastor: pastor,
      });
    });

    //? Actualizar en todos los family Home el nuevo pastor del copastor que se actualiza.
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor.id === dataCoPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_pastor: pastor,
        });
      },
    );

    //* Conteo y asignacion de Casas
    const familyHouses = await this.familyHomeRepository.find();
    const listFamilyHouses = familyHouses.filter(
      (home) => home.their_copastor.id === id,
    );

    const familyHousesId = listFamilyHouses.map((houses) => houses.id);

    //* Conteo y asignacion de Preachers
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_copastor.id === id,
    );

    const listPreachersId = listPreachers.map((preacher) => preacher.id);

    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updateCoPastorDto,
      their_pastor: pastor,
      is_active: is_active,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      family_houses: familyHousesId,
      count_houses: familyHouses.length,
      preachers: listPreachersId,
      count_preachers: listPreachers.length,
      member: dataMember,
      is_active: is_active,
      their_pastor: pastor,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
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

    return coPastor;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    //? Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      is_active: false,
    });

    //? Update and set in false is_active on coPastor
    const coPastor = await this.coPastorRepository.preload({
      id: dataCoPastor.id,
      their_pastor: null,
      is_active: false,
    });

    //? Update and set to null in Preacher
    const allPreachers = await this.preacherRepository.find();
    const preachersByPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor.id === dataCoPastor.id,
    );
    // TODO : recordar en pracher al actualizar, y cuando se coloca el nuevo id_copastor, de ahi sacar el pastor y setearlo.
    //! Primero se debe actualizar el preacher, y luego la casa familiar del copastor que se elimino, ya que en actualizar
    //! la casa se asigna un nuevo preacher y este jala al preacher y su copastor y pastgor relacionado.
    //? Pero si no hay uin copastor en el preacher al actualizar la casa seguira estandi vacion el copastor.
    //! Otro seria que al actualizar el preacher su nuevo copastor, se asigne el pastor y copastor y en la tabla
    //! casa familiar, se setee el nuevo copastor para ese preacherID que se esta actualizando.
    //? Recordar que al actualizar un preacher con un nuevo copastor aparte de setear en casa familiar, se debe
    //? setear en todos los demas lugares, en la tabla miembro solo el registro del preacherID y en la misma
    //? tabla preacher solo ese registro
    //* Osea se eliminan todos los copastores, pero al agregar uno nuevo se hace solo de manera independiente (Revisar en preacher)

    const promisesPreacher = preachersByPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_copastor: null,
      });
    });

    //? Update and set to null in Family Home
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor.id === coPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_copastor: null,
        });
      },
    );

    //? Update and set to null in Member, all those who have the same Pastor
    const allMembers = await this.memberRepository.find();
    const membersByPastor = allMembers.filter(
      (member) => member.their_copastor.id === dataCoPastor.id,
    );

    const promisesMembers = membersByPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_copastor: null,
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
  //* Para futuros errores de indices o constrains con code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  private searchCoPastorBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    repository: Repository<Member>,
  ) => {
    //* Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const coPastorMembers = members.filter((member) =>
        member.roles.includes('copastor'),
      );

      if (coPastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'copastor'`);
      }

      const coPastores = await this.coPastorRepository.find();

      const newCoPastorMembers = coPastorMembers.map((member) => {
        const newCoPastores = coPastores.filter(
          (coPastor) =>
            coPastor.member.id === member.id && coPastor.is_active === true,
        );
        return newCoPastores;
      });

      const ArrayCoPastorMembersFlattened = newCoPastorMembers.flat();

      if (ArrayCoPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found coPastor with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const coPastorMembers = members.filter((member) =>
        member.roles.includes('copastor'),
      );

      if (coPastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const coPastores = await this.coPastorRepository.find();

      const newCoPastorMembers = coPastorMembers.map((member) => {
        const newCoPastores = coPastores.filter(
          (coPastor) =>
            coPastor.member.id === member.id && coPastor.is_active === true,
        );
        return newCoPastores;
      });

      const ArrayCoPastorMembersFlattened = newCoPastorMembers.flat();

      if (ArrayCoPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found coPastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }
  };
}
