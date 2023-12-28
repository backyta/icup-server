import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { Preacher } from '../preacher/entities/preacher.entity';
import { FamilyHome } from '../family-home/entities/family-home.entity';

import { PastorService } from '../pastor/pastor.service';
import { CoPastorService } from '../copastor/copastor.service';
import { PreacherService } from '../preacher/preacher.service';

import { SearchType } from '../common/enums/search-types.enum';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { searchPerson, searchFullname, updateAge } from '../common/helpers';

@Injectable()
export class MembersService {
  private readonly logger = new Logger('MermbersService');

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

    private readonly pastorService: PastorService,

    private readonly coPastorService: CoPastorService,

    private readonly preacherService: PreacherService,
  ) {}

  //TODO : despues de pribar todo unir ramas y comenzar con module ofrendas

  //TODO (UPDATE ENDPOINT): revisar que pasa si se envia en id de preacher en Copastor, ver si lo rechaza o acepta o crear algun problema, deberia solo aceptar id de preacher para preacher de coapstor para copastor, etc
  //! Hacer lo de arriba cuando tengamos todo listo y probar todo junto

  //TODO : revisar los rel 1, rel 2 y las cargas de las relaciones en los filters y en el module common
  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const {
      roles,
      their_pastor,
      their_copastor,
      their_preacher,
      their_family_home,
    } = createMemberDto;

    //! Role validation (only 1 and member)
    if (!roles.includes('member')) {
      throw new BadRequestException(
        `The member role should always be included in the roles`,
      );
    }

    if (
      (roles.includes('pastor') && roles.includes('copastor')) ||
      (roles.includes('pastor') && roles.includes('preacher')) ||
      (roles.includes('pastor') && roles.includes('treasurer')) ||
      (roles.includes('copastor') && roles.includes('pastor')) ||
      (roles.includes('copastor') && roles.includes('preacher')) ||
      (roles.includes('copastor') && roles.includes('treasurer')) ||
      (roles.includes('preacher') && roles.includes('pastor')) ||
      (roles.includes('preacher') && roles.includes('copastor'))
    ) {
      throw new BadRequestException(
        `Only one main role can be assigned: ['Pastor, Copastor or Preacher'], only the Preacher role can play the Treasurer role.`,
      );
    }

    if (
      roles.includes('member') &&
      roles.includes('treasurer') &&
      !roles.includes('pastor') &&
      !roles.includes('copastor') &&
      !roles.includes('preacher')
    ) {
      throw new BadRequestException(
        `A member with the member role cannot be assigned as treasurer, it can only be assigned to the preacher role`,
      );
    }

    //! Validations assignment of their leaders according to role
    if (
      (roles.includes('pastor') && their_pastor) ||
      (roles.includes('pastor') && their_copastor) ||
      (roles.includes('pastor') && their_preacher) ||
      (roles.includes('pastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `A Pastor, Co-Pastor, Preacher or Family House cannot be assigned to a member with the Pastor role`,
      );
    }

    if (
      (roles.includes('copastor') && their_pastor) ||
      (roles.includes('copastor') && their_copastor) ||
      (roles.includes('copastor') && their_preacher) ||
      (roles.includes('copastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `A Pastor, Copastor, Preacher or Family House cannot be assigned to a member with a Copastor role, first create Copastor`,
      );
    }

    if (
      (roles.includes('preacher') && their_copastor) ||
      (roles.includes('preacher') && their_pastor) ||
      (roles.includes('preacher') && their_pastor) ||
      (roles.includes('preacher') && their_family_home)
    ) {
      throw new BadRequestException(
        `Cannot assign a Pastor, Copastor, Preacher, or family home to a member with Preacher role, first create Preacher`,
      );
    }

    if (
      roles.includes('member') &&
      !roles.includes('preacher') &&
      !roles.includes('copastor') &&
      !roles.includes('pastor') &&
      (their_pastor || their_copastor || their_preacher || !their_family_home)
    ) {
      throw new BadRequestException(
        `A pastor, co-pastor or preacher cannot be assigned to a member with the role only of Member, assign only family_home`,
      );
    }

    //* Validations Pastor, Copastor, Preacher, Casa
    let pastor: Pastor;
    let copastor: CoPastor;
    let preacher: Preacher;
    let familyHome: FamilyHome;

    //? If their_family_home exists, it is a Member
    if (their_family_home) {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
      preacher = await this.preacherRepository.findOneBy({
        id: familyHome.their_preacher.id,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: familyHome.their_copastor.id,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: familyHome.their_pastor.id,
      });
    }

    //* Create instance
    try {
      const member = this.memberRepository.create({
        ...createMemberDto,
        their_copastor: copastor,
        their_pastor: pastor,
        their_preacher: preacher,
        their_family_home: familyHome,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      await this.memberRepository.save(member);

      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Member[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.memberRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY SEARCH TERM AND TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let member: Member | Member[];

    //* Find UUID --> One
    if (isUUID(term) && type === SearchType.id) {
      member = await this.memberRepository.findOne({
        where: { id: term },
        relations: [
          'their_copastor',
          'their_pastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      if (!member) {
        throw new BadRequestException(`Pastor was not found with this UUID`);
      }

      member.age = updateAge(member);
      await this.memberRepository.save(member);
    }

    //* Find gender --> Many
    if (term && type === SearchType.gender) {
      member = await this.findMembersWithPagination(
        SearchType.gender,
        term,
        limit,
        offset,
      );
    }

    //* Find maritalStatus --> Many
    if (term && type === SearchType.maritalStatus) {
      member = await this.findMembersWithPagination(
        SearchType.maritalStatus,
        term,
        limit,
        offset,
      );
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      member = await this.findMembersWithPagination(
        SearchType.isActive,
        term,
        limit,
        offset,
      );
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      member = await searchPerson({
        term,
        searchType: SearchType.firstName,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName) {
      member = await searchPerson({
        term,
        searchType: SearchType.lastName,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find fullName --> Many
    if (term && type === SearchType.fullName) {
      member = await searchFullname({
        term,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find roles --> Many
    if (term && type === SearchType.roles) {
      const rolesArray = term.split('-');

      member = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.roles @> ARRAY[:...roles]::text[]', {
          roles: rolesArray,
        })
        .andWhere(`member.is_active =:isActive`, { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `Not found members with these roles: ${rolesArray}`,
        );
      }
    }

    //* Find Members for their_copastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_copastor =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No Members found with this their_copastor: ${term} `,
        );
      }
    }

    //* Find Members for their_preacher --> Many
    if (isUUID(term) && type === SearchType.their_preacher) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_preacher =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No Members found with this their_preacher : ${term} `,
        );
      }
    }

    //* Find Members for their_FamilyHome --> Many
    if (isUUID(term) && type === SearchType.their_family_home) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.their_pastor', 'rel1')
        .leftJoinAndSelect('member.their_copastor', 'rel2')
        .leftJoinAndSelect('member.their_preacher', 'rel3')
        .leftJoinAndSelect('member.their_family_home', 'rel4')
        .where('member.their_family_home =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No members found with this your_family_home : ${term} `,
        );
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

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

  //TODO : empezar a probar los updates y delete de todos los lugares, y luyego pasar a unir ramas y crear ofrendas.

  //* UPDATE FOR ID
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const {
      roles,
      their_copastor,
      their_pastor,
      their_preacher,
      their_family_home,
    } = updateMemberDto;

    //! General Validations
    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the member`,
      );
    }

    //NOTE : el is_active seria opcional
    //NOTE : Desde el front evitar que un registro en is_Active true, se pueda cambiar a false desde actualizar, solo se hace desde eliminar, pero un registro que este en false, preguntar si se quiere colocar activo
    //NOTE : Desde actualizar Si el registro esta en false, preguntar si se quiere activar, si esta en true, mantenerlo y ocultar el isactive
    // if (is_active === undefined) {
    //   throw new BadRequestException(
    //     `You must assign a boolean value to is_active`,
    //   );
    // }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataMember = await this.memberRepository.findOne({
      where: { id: id },
      relations: [
        'their_pastor',
        'their_copastor',
        'their_preacher',
        'their_family_home',
      ],
    });

    if (!dataMember) {
      throw new NotFoundException(`Member not found with id: ${id}`);
    }

    //* Role validation (only 1 and member)

    if (!roles.includes('member')) {
      throw new BadRequestException(
        `The "member" role should always be included in the roles`,
      );
    }

    if (
      !roles.some((role) =>
        ['pastor', 'copastor', 'preacher', 'member'].includes(role),
      )
    ) {
      throw new BadRequestException(
        `The roles should include "pastor", "copastor" or "preacher"`,
      );
    }

    if (
      (roles.includes('pastor') && roles.includes('copastor')) ||
      (roles.includes('pastor') && roles.includes('preacher')) ||
      (roles.includes('pastor') && roles.includes('treasurer')) ||
      (roles.includes('copastor') && roles.includes('pastor')) ||
      (roles.includes('copastor') && roles.includes('preacher')) ||
      (roles.includes('copastor') && roles.includes('treasurer')) ||
      (roles.includes('preacher') && roles.includes('pastor')) ||
      (roles.includes('preacher') && roles.includes('copastor'))
    ) {
      throw new BadRequestException(
        `Only one main role can be assigned: ['Pastor, Copastor or Preacher'], only the Preacher role can play the Treasurer role.`,
      );
    }

    //! Validation when updating roles (of the member), they cannot be lower
    if (
      (dataMember.roles.includes('pastor') && roles.includes('copastor')) ||
      (dataMember.roles.includes('pastor') && roles.includes('preacher')) ||
      (dataMember.roles.includes('pastor') && roles.includes('treasurer')) ||
      (dataMember.roles.includes('pastor') &&
        roles.includes('member') &&
        !roles.includes('pastor'))
    ) {
      throw new BadRequestException(
        `You cannot assign a role lower than Pastor`,
      );
    }

    if (
      (dataMember.roles.includes('copastor') && roles.includes('preacher')) ||
      (dataMember.roles.includes('copastor') && roles.includes('treasurer')) ||
      (dataMember.roles.includes('copastor') &&
        roles.includes('member') &&
        !roles.includes('copastor') &&
        !roles.includes('pastor'))
    ) {
      throw new BadRequestException(
        `Cannot be assigned a role lower than CoPastor`,
      );
    }

    if (
      (dataMember.roles.includes('preacher') && roles.includes('pastor')) ||
      (dataMember.roles.includes('preacher') &&
        roles.includes('member') &&
        !roles.includes('preacher') &&
        !roles.includes('copastor'))
    ) {
      throw new BadRequestException(
        `A higher role cannot be assigned without going through the hierarchy: [preacher, co-pastor, pastor]. Also cannot be assigned a role lower than CoPastor`,
      );
    }

    if (
      (dataMember.roles.includes('member') &&
        !dataMember.roles.includes('preacher') &&
        !dataMember.roles.includes('copastor') &&
        !dataMember.roles.includes('pastor') &&
        roles.includes('copastor')) ||
      roles.includes('pastor')
    ) {
      throw new BadRequestException(
        `A higher role cannot be assigned without going through the hierarchy: [preacher, co-pastor, pastor]`,
      );
    }

    //* Validations assignment of their leaders according to role
    if (
      roles.includes('pastor') &&
      (their_pastor || their_copastor || their_preacher || their_family_home)
    ) {
      throw new BadRequestException(
        `You cannot assign a their_pastor, their_coPastor, their_preacher, or their_family_home to a member with the Pastor role`,
      );
    }

    if (
      roles.includes('copastor') &&
      (their_copastor || their_preacher || their_family_home || !their_pastor)
    ) {
      throw new BadRequestException(
        `A member with the coPastor role cannot be assigned a their_coPastor, their_preacher, or their_family_home, only their_pastor`,
      );
    }
    //NOTE: desde el front hacer un modal que diga subir de nivel y setear los datos, tmb para colocar casa temporal a preacher
    //! Colocar el rol como disabled y coloca boton que diga subir de nivel para evitar errores, con las validaciones.

    //NOTE : para asignar a un predicador a un casa moimentanea a la que congrege
    if (
      roles.includes('preacher') &&
      (their_preacher || their_pastor || !their_copastor)
    ) {
      throw new BadRequestException(
        `You cannot assign a their_preacher or their_pastor a member with the Preacher role, only their_copastor and their_family_home (temporally)`,
      );
    }

    if (
      roles.includes('member') &&
      !roles.includes('pastor') &&
      !roles.includes('copastor') &&
      !roles.includes('preacher') &&
      (their_preacher || their_pastor || their_copastor || !their_family_home)
    ) {
      throw new BadRequestException(
        `You cannot assign their_preacher or their_pastor or their_copastor a member with the Member role, only their_family_home`,
      );
    }

    let pastor: Pastor;
    let copastor: CoPastor;
    let preacher: Preacher;
    let familyHome: FamilyHome;
    let member: Member;

    //! Pastor Validation (If pastor remains in pastor role)
    if (dataMember.roles.includes('pastor') && roles.includes('pastor')) {
      pastor = null;
      copastor = null;
      preacher = null;
      familyHome = null;

      member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      const allPastores = await this.pastorRepository.find();
      const dataPastor = allPastores.find(
        (pastor) => pastor.member.id === member.id,
      );

      const updatePastor = await this.pastorRepository.preload({
        id: dataPastor.id,
        member: member,
      });

      try {
        await this.pastorRepository.save(updatePastor);
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! CoPastor Validation (If copastor remains in copastor role)
    if (dataMember.roles.includes('copastor') && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${their_pastor}`,
        );
      }

      //* Search Copastor table and update the new pastor
      const allCopastores = await this.coPastorRepository.find();
      const dataCopastor = allCopastores.find(
        (copastor) => copastor.member.id === dataMember.id,
      );

      //* Search the preacher table for copastor and set the new pastor.
      //? Change pastors in Preacher to everyone who has the same co-pastor.
      const allPreachers = await this.preacherRepository.find();
      const arrayPreachersByCopastor = allPreachers.filter(
        (preacher) => preacher.their_copastor.id === dataCopastor.id,
      );

      const promisesPreachers = arrayPreachersByCopastor.map(
        async (preacher) => {
          await this.preacherRepository.update(preacher.id, {
            their_pastor: pastor,
          });
        },
      );

      //? Change pastors in Member to all those who have the same co-pastor
      const allMembers = await this.memberRepository.find({
        relations: ['their_copastor'],
      });
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_copastor?.id === dataCopastor.id,
      );

      const promisesMembers = arrayMembersPreachers.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_pastor: pastor,
        });
      });

      //? Search the table for family home according to copastor and set the new pastor.
      const allFamilyHouses = await this.familyHomeRepository.find();

      const arrayHousesByCopastor = allFamilyHouses.filter(
        (home) => home.their_copastor.id === dataCopastor.id,
      );

      const promisesFamilyHouses = arrayHousesByCopastor.map(async (home) => {
        await this.familyHomeRepository.update(home.id, {
          their_pastor: pastor,
        });
      });

      member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      const updateCopastorMember = await this.coPastorRepository.preload({
        id: dataCopastor.id,
        member: member,
        their_pastor: pastor,
      });

      try {
        const result = await this.memberRepository.save(member);
        await this.coPastorRepository.save(updateCopastorMember);
        await Promise.all(promisesPreachers);
        await Promise.all(promisesMembers);
        await Promise.all(promisesFamilyHouses);
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //TODO : continuar aqui la revision
    //* Tecnicamente aqui solo se podra cambiar la data del member, todo lo demas desde el module Preacher
    //? Y para colocar una casa temporal al preacher que se quedo sin casa relacionada (casa inactiva o preacher cambiado de zona, copastor)

    //! Preacher Validation (If preacher remains in preacher role)
    if (dataMember.roles.includes('preacher') && roles.includes('preacher')) {
      preacher = null;
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: copastor.their_pastor.id,
      });
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });

      if (!copastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${their_copastor}`,
        );
      }

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${copastor.their_pastor.id}`,
        );
      }

      if (!familyHome) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${their_family_home}`,
        );
      }

      if (dataMember.their_family_home && their_family_home) {
        throw new BadRequestException(
          `No se puede colocar un nuevo their_family_home, porque ya existe uno`,
        );
      }

      //? It is not allowed to change the co-pastor directly here, because he has a house assigned to a zone (co-pastor).
      if (
        dataMember.their_family_home &&
        dataMember.their_copastor?.id !== copastor.id
      ) {
        throw new BadRequestException(
          `You cannot change their_copastor to a Preacher-Member assigned to a Family House, because they already have their_copastor, first update their_copastor in the Preacher Module`,
        );
      }

      //TODO : regresar aqui para pobrar actualizar cuando se elimia si family_home (coloca como inactivo y se elimina la relacion)
      //! It is to only temporarily assign a house to the preacher, their_copastor must be the same, everything is updated from preacher.
      if (
        dataMember.their_family_home === null &&
        dataMember.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `To assign a temporary house or change their_copastor to the preacher, their_copastor must be the same, if you want to use another, you must first update it in the Preacher Module`,
        );
      }

      //! Esto ya esta probado
      //* If it exists and the co-pastor is the same, the same data is set (only modify the rest)
      if (
        dataMember.their_family_home &&
        dataMember.their_copastor.id === copastor.id
      ) {
        member = await this.memberRepository.preload({
          id: dataMember.id,
          ...updateMemberDto,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
          their_pastor: pastor,
          their_copastor: copastor,
          their_preacher: preacher,
          their_family_home: dataMember.their_family_home,
        });
      }

      //? Falta probar aqui cuando este en null, la casa y tenga el mismo copastor, osea el predicador solo
      //? se podra congregar en una residencia de su zona del mismo copasor.
      //* If it does not exist, it exists and the co-pastor is the same, the temporary house is set (the rest is also modified)
      if (
        dataMember.their_family_home === null &&
        dataMember.their_copastor.id === copastor.id
      ) {
        member = await this.memberRepository.preload({
          id: dataMember.id,
          ...updateMemberDto,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
          their_pastor: pastor,
          their_copastor: copastor,
          their_preacher: preacher,
          their_family_home: familyHome,
        });
      }

      const allPreachers = await this.preacherRepository.find();
      const dataPreacher = allPreachers.find(
        (preacher) => preacher.member.id === dataMember.id,
      );

      const updatePreacherMember = await this.preacherRepository.preload({
        id: dataPreacher.id,
        member: member,
        their_copastor: copastor,
        their_pastor: pastor,
      });

      try {
        const result = await this.memberRepository.save(member);
        await this.preacherRepository.save(updatePreacherMember);
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! Member Validation (If member remains in member)
    if (
      dataMember.roles.includes('member') &&
      !dataMember.roles.includes('pastor') &&
      !dataMember.roles.includes('copastor') &&
      !dataMember.roles.includes('preacher') &&
      roles.includes('member') &&
      !roles.includes('pastor') &&
      !roles.includes('copastor') &&
      !roles.includes('preacher')
    ) {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
      preacher = await this.preacherRepository.findOneBy({
        id: familyHome.their_preacher.id,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: familyHome.their_copastor.id,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: familyHome.their_pastor.id,
      });

      if (!familyHome) {
        throw new NotFoundException(
          `Family Home was not found, with the id ${their_family_home}`,
        );
      }

      if (!preacher) {
        throw new NotFoundException(
          `Preacher was not found, verify that Family Home has a preacher assigned`,
        );
      }

      if (!copastor) {
        throw new NotFoundException(
          `Copastor was not found, verify that Family Home has a copastor assigned`,
        );
      }

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found, verify that Family Home has a co-pastor assigned`,
        );
      }

      member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? NOW HERE THEY RAISE A LEVEL
    //NOTE : luego de eliminar las relaciones, se debe elegir nuevo copastor para los preacher huefanos
    //NOTE : despues en la casa familiar jalar los preachers que se actualizaron sus relaciones (revisar)

    //! Validation If co-pastor rises to Pastor role
    if (dataMember.roles.includes('copastor') && roles.includes('pastor')) {
      pastor = null;
      copastor = null;
      preacher = null;
      familyHome = null;

      //* Search the copastors table and eliminate the relationship.
      const allCopastores = await this.coPastorRepository.find();
      const dataCopastor = allCopastores.find(
        (copastor) => copastor.member.id === dataMember.id,
      );

      const updateCopastor = await this.coPastorRepository.preload({
        id: dataCopastor.id,
        member: null,
        their_pastor: null,
      });

      //* Search the preacher table and delete the relationship.

      //? Delete all same co-pastor relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const arrayPreachersByCopastor = allPreachers.filter(
        (preacher) => preacher.their_copastor?.id === dataCopastor.id,
      );

      const promisesPreachers = arrayPreachersByCopastor.map(
        async (preacher) => {
          await this.preacherRepository.update(preacher.id, {
            their_copastor: null,
            their_pastor: null,
          });
        },
      );

      //? Delete all same co-pastor relationships in Member
      const allMembers = await this.memberRepository.find({
        relations: ['their_copastor'],
      });
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_copastor?.id === dataCopastor?.id,
      );

      const promisesMembers = arrayMembersPreachers.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
        });
      });

      //* Search the familyHome table and delete the relationship.
      const allFamilyHouses = await this.familyHomeRepository.find();
      const arrayHousesByCopastor = allFamilyHouses.filter(
        (home) => home.their_copastor?.id === dataCopastor.id,
      );

      const promisesFamilyHouses = arrayHousesByCopastor.map(async (home) => {
        await this.familyHomeRepository.update(home.id, {
          their_copastor: null,
          their_pastor: null,
        });
      });

      //! Eliminate the Copastor who rose to pastor
      //* Assign the new role to the member and with that create the new pastor
      member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        const result = await this.memberRepository.save(member);
        await this.coPastorRepository.save(updateCopastor);
        await Promise.all(promisesPreachers);
        await Promise.all(promisesMembers);
        await Promise.all(promisesFamilyHouses);
        await this.coPastorRepository.delete(dataCopastor.id);
        await this.pastorService.create({
          id_member: dataMember.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    // NOTE : luego de subir de niuevel, actualizar a las casa desamparadas con nuevo preacher y jalar esa data en Miembros, asignadoles la misma casa y otro (jala la misma data (Miembros))
    //! Validation If preacher rises to Copastor
    if (dataMember.roles.includes('preacher') && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${their_pastor}`,
        );
      }

      //* Search the preacher table and eliminate the relationship (member, copastor and pastor)
      const allPreachers = await this.preacherRepository.find();
      const dataPreacher = allPreachers.find(
        (preacher) => preacher.member.id === dataMember.id,
      );

      const updatePreacher = await this.preacherRepository.preload({
        id: dataPreacher.id,
        member: null,
        their_copastor: null,
        their_pastor: null,
      });

      //* Search the familyHome table and delete the relationship.
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHomePreacher = allFamilyHouses.find(
        (home) => home.their_preacher?.member.id === dataMember.id,
      );

      const updateFamilyHome = await this.familyHomeRepository.preload({
        id: familyHomePreacher.id,
        their_preacher: null,
        their_copastor: null,
        their_pastor: null,
      });

      //? Delete all same preacher relationships in Member
      const allMembers = await this.memberRepository.find({
        relations: ['their_preacher'],
      });
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_preacher?.id === dataPreacher.id,
      );

      const promisesMembers = arrayMembersPreachers.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_preacher: null,
          their_copastor: null,
          their_pastor: null,
        });
      });

      //! Delete the Preacher who uploaded Copastor
      //* Assign the new role to the member and with that create the new Copastor
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        const result = await this.memberRepository.save(member);
        await this.preacherRepository.save(updatePreacher);
        await this.familyHomeRepository.save(updateFamilyHome);
        await Promise.all(promisesMembers);
        await this.preacherRepository.delete(dataPreacher.id);
        await this.coPastorService.create({
          id_member: dataMember.id,
          their_pastor: pastor.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //NOTE : una vez que se sube de nivel a preacher y se setea su copastor, choca con la validacion de cambiar el copastor desde module-prechaer, porque ya es copastor(role)
    //NOTE : solo crea al nuevo preacher, de ahi en casa se puede asignar este preacher a una casa segun su copastor (zona)

    //! If a Member transforms into a Preacher
    if (
      dataMember.roles.includes('member') &&
      !dataMember.roles.includes('preacher') &&
      roles.includes('preacher')
    ) {
      preacher = null;
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: copastor.their_pastor.id,
      });
      familyHome = null;

      if (!copastor) {
        throw new NotFoundException(
          `coPastor was not found with the ID ${their_copastor}`,
        );
      }

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${copastor.their_pastor.id}`,
        );
      }

      //* Assign the new role to the member and with that create the new Copastor
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        const result = await this.memberRepository.save(member);
        await this.preacherService.create({
          id_member: dataMember.id,
          their_copastor: copastor.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //TODO : continuar aqui tomorrow .... 29/12, y los demas modules sus updates
  //* DELETE FOR ID
  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataMember = await this.memberRepository.findOneBy({ id: id });
    if (!dataMember) {
      throw new BadRequestException(`Member with id ${id} not exist`);
    }

    //! Delete all member relations.
    const member = await this.memberRepository.preload({
      id: dataMember.id,
      their_copastor: null,
      their_pastor: null,
      their_family_home: null,
      is_active: false,
    });

    //! Unsubscribe all places that are related to this pastor, and make it inactive in Pastor and Member
    if (
      dataMember.roles.includes('pastor') &&
      dataMember.roles.includes('member')
    ) {
      const pastores = await this.pastorRepository.find();
      const pastorMember = pastores.find(
        (pastor) => pastor.member.id === dataMember.id,
      );

      if (!pastorMember) {
        throw new NotFoundException(`Not found pastor`);
      }

      //? Update and set null in Pastor
      const pastor = await this.pastorRepository.preload({
        id: pastorMember.id,
        is_active: false,
      });

      //? Update and set to null in Copastor
      const allCopastores = await this.coPastorRepository.find();
      const copastoresByPastor = allCopastores.filter(
        (copastor) => copastor.their_pastor.id === pastorMember.id,
      );

      const promisesCopastor = copastoresByPastor.map(async (copastor) => {
        await this.coPastorRepository.update(copastor.id, {
          their_pastor: null,
        });
      });

      //? Update and set to null in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByPastor = allPreachers.filter(
        (preacher) => preacher.their_pastor.id === pastorMember.id,
      );

      const promisesPreacher = preachersByPastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          their_pastor: null,
        });
      });

      //? Update and set to null in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_pastor.id === pastorMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_pastor: null,
          });
        },
      );

      //? Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find();
      const membersByPastor = allMembers.filter(
        (member) => member.their_pastor.id === pastorMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_pastor: null,
        });
      });

      try {
        await this.memberRepository.save(member);
        await this.pastorRepository.save(pastor);
        await Promise.all(promisesMembers);
        await Promise.all(promisesCopastor);
        await Promise.all(promisesPreacher);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! Unsubscribe all places that are related to this CoPastor, and make it inactive in CoPastor and Member
    if (
      member.roles.includes('copastor') &&
      dataMember.roles.includes('member')
    ) {
      const coPastores = await this.coPastorRepository.find();
      const coPastorMember = coPastores.find(
        (coPastor) => coPastor.member.id === id,
      );

      if (!coPastorMember) {
        throw new NotFoundException(`Not found copastor`);
      }

      //? Update and set null in CoPastor
      const copastor = await this.coPastorRepository.preload({
        id: coPastorMember.id,
        their_pastor: null,
        is_active: false,
      });

      //? Update and set to null in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByPastor = allPreachers.filter(
        (preacher) => preacher.their_copastor.id === coPastorMember.id,
      );

      const promisesPreacher = preachersByPastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          their_copastor: null,
          their_pastor: null,
        });
      });

      //? Update and set to null in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_copastor.id === coPastorMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_copastor: null,
            their_pastor: null,
          });
        },
      );

      //? Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find();
      const membersByPastor = allMembers.filter(
        (member) => member.their_copastor.id === coPastorMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
        });
      });

      try {
        await this.memberRepository.save(member);
        await this.coPastorRepository.save(copastor);
        await Promise.all(promisesMembers);
        await Promise.all(promisesPreacher);
        await Promise.all(promisesFamilyHouses);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! Unsubscribe all places that are related to this Preacher, and make it inactive in Preacher and Member
    if (
      member.roles.includes('preacher') &&
      dataMember.roles.includes('member')
    ) {
      const preachers = await this.preacherRepository.find();
      const preacherMember = preachers.find(
        (preacher) => preacher.member.id === id,
      );

      if (!preacherMember) {
        throw new NotFoundException(`Not found preacher`);
      }

      const preacher = await this.preacherRepository.preload({
        id: preacherMember.id,
        their_copastor: null,
        their_pastor: null,
        is_active: false,
      });

      //? Update and set to null in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_preacher.id === preacherMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_preacher: null,
            their_pastor: null,
            their_copastor: null,
          });
        },
      );

      //? Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find();
      const membersByPastor = allMembers.filter(
        (member) => member.their_preacher.id === preacherMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_preacher: null,
          their_pastor: null,
          their_copastor: null,
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

    //! Unsubscribe all places that are related to this Member, and make it inactive in Preacher and Member
    if (
      member.roles.includes('member') &&
      (!member.roles.includes('pastor') ||
        !member.roles.includes('copastor') ||
        !member.roles.includes('preacher') ||
        !member.roles.includes('treasurer'))
    ) {
      try {
        await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
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

  private async findMembersWithPagination(
    searchType: string,
    term: string,
    limit: number,
    offset: number,
  ): Promise<Member[]> {
    const whereCondition = {};
    if (searchType === 'is_active') {
      try {
        whereCondition[searchType] = term;

        const members = await this.memberRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          relations: [
            'their_pastor',
            'their_copastor',
            'their_preacher',
            'their_family_home',
          ],
          order: { created_at: 'ASC' },
        });

        if (members.length === 0) {
          throw new NotFoundException(
            `Not found Members with this term: ${term}`,
          );
        }

        return members;
      } catch (error) {
        if (error.code === '22P02') {
          throw new BadRequestException(
            `This term is not a valid boolean value`,
          );
        }

        throw error;
      }
    }

    whereCondition[searchType] = term;
    whereCondition['is_active'] = true;

    const members = await this.memberRepository.find({
      where: [whereCondition],
      take: limit,
      skip: offset,
      relations: [
        'their_pastor',
        'their_copastor',
        'their_preacher',
        'their_family_home',
      ],
      order: { created_at: 'ASC' },
    });

    if (members.length === 0) {
      throw new NotFoundException(`Not found member with these names: ${term}`);
    }
    return members;
  }
}
