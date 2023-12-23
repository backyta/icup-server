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
      (roles.includes('copastor') && their_copastor) ||
      (roles.includes('copastor') && their_preacher) ||
      (roles.includes('copastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `A Copastor, Preacher or Family House cannot be assigned to a member with a Copastor role, assign only pastor`,
      );
    }

    if (
      (roles.includes('preacher') && their_preacher) ||
      (roles.includes('preacher') && their_pastor) ||
      (roles.includes('preacher') && their_family_home)
    ) {
      throw new BadRequestException(
        `Cannot assign a preacher, pastor or family home to a member with Preacher role, assign only copastor`,
      );
    }

    if (
      roles.includes('member') &&
      !roles.includes('preacher') &&
      !roles.includes('copastor') &&
      !roles.includes('pastor') &&
      (their_pastor || their_copastor || their_preacher)
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

    //? If their_pastor exists it is because it is a Copastor
    if (their_pastor) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;
    }

    //? If their_copastor exists it is because he is a Preacher
    if (their_copastor) {
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: copastor.their_pastor.id,
      });
      preacher = null;
      familyHome = null;
    }

    //? If their_preacher exists it is because it is a Family House
    if (their_preacher) {
      preacher = await this.preacherRepository.findOneBy({
        id: their_preacher,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: preacher.their_copastor.id,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: preacher.their_pastor.id,
      });
      familyHome = null;
    }

    //? If their_family_home exists, it is a Member
    if (their_preacher) {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_preacher,
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
        'their_pastor_id',
        'their_copastor_id',
        'their_family_home',
        'their_preacher',
      ],
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
          'their_copastor_id',
          'their_pastor_id',
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
        .leftJoinAndSelect('member.their_pastor_id', 'rel1')
        .leftJoinAndSelect('member.their_copastor_id', 'rel2')
        .leftJoinAndSelect('member.their_preacher_id', 'rel3')
        .leftJoinAndSelect('member.their_family_home_id', 'rel4')
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
        .leftJoinAndSelect('member.their_pastor_id', 'rel1')
        .leftJoinAndSelect('member.their_copastor_id', 'rel2')
        .leftJoinAndSelect('member.their_preacher_id', 'rel3')
        .leftJoinAndSelect('member.their_family_home_id', 'rel4')
        .where('member.their_preacher = :term', { term })
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
        .leftJoinAndSelect('member.their_pastor_id', 'rel1')
        .leftJoinAndSelect('member.their_copastor_id', 'rel2')
        .leftJoinAndSelect('member.their_preacher_id', 'rel3')
        .leftJoinAndSelect('member.their_family_home_id', 'rel4')
        .where('member.their_copastor = :term', { term })
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
        .leftJoinAndSelect('member.their_pastor_id', 'rel1')
        .leftJoinAndSelect('member.their_copastor_id', 'rel2')
        .leftJoinAndSelect('member.their_preacher_id', 'rel3')
        .leftJoinAndSelect('member.their_family_home_id', 'rel4')
        .where('member.their_family_home = :term', { term })
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

  //TODO : hacer documentacion de update and deleted (actualizar documentacion)
  //* UPDATE FOR ID
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const {
      roles,
      their_copastor,
      their_pastor,
      their_preacher,
      their_family_home,
      is_active,
    } = updateMemberDto;

    //! General Validations
    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the member`,
      );
    }

    if (is_active === undefined) {
      throw new BadRequestException(
        `You must assign a boolean value to is_active`,
      );
    }

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
      (dataMember.roles.includes('pastor') && roles.includes('treasurer'))
    ) {
      throw new BadRequestException(
        `You cannot assign a role lower than Pastor`,
      );
    }

    if (
      (dataMember.roles.includes('copastor') && roles.includes('preacher')) ||
      (dataMember.roles.includes('copastor') && roles.includes('treasurer'))
    ) {
      throw new BadRequestException(
        `Cannot be assigned a role lower than CoPastor`,
      );
    }

    if (dataMember.roles.includes('preacher') && roles.includes('pastor')) {
      throw new BadRequestException(
        `You cannot assign a higher role without going through the hierarchy: [pracher, co-pastor, pastor]`,
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
      (their_copastor || their_preacher || their_family_home)
    ) {
      throw new BadRequestException(
        `A member with the coPastor role cannot be assigned a their_coPastor, their_preacher, or their_family_home, only their_pastor`,
      );
    }

    if (
      roles.includes('preacher') &&
      (their_preacher || their_pastor || !their_copastor || !their_family_home)
    ) {
      throw new BadRequestException(
        `You cannot assign a their_preacher or their_pastor a member with the Preacher role, only their_copastor.`,
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

    //! Revisar bien
    //! CoPastor Validation (If copastor remains in copastor role)
    if (dataMember.roles.includes('copastor') && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;

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
      const allMembers = await this.memberRepository.find();
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_copastor.id === dataCopastor.id,
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

    //* Tecnicamente aqui solo se podra cambiar la data del member, todo lo demas desde el module Preacher
    //? Para colocar una casa momentanea al preacher que se quedo sin casa relacionada (casa inactiva o preacher cambiado de zona, copastor)

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

      //? Validation same copastor
      const allMembers = await this.memberRepository.find();
      const dataMemberPreacher = allMembers.find(
        (member) => member.their_preacher.id === dataMember.their_preacher.id,
      );

      if (
        dataMemberPreacher.their_family_home &&
        dataMemberPreacher.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `You cannot switch from Their_copastor to a Preacher assigned to a zoned Family House, first update the Their_copastor in Preacher Module`,
        );
      }

      if (
        dataMemberPreacher.their_family_home === null &&
        dataMemberPreacher.their_copastor.id !== copastor.id
      ) {
        throw new BadRequestException(
          `To assign a temporary house to the preacher without a house, their_copastor must be the same, you cannot use another, if you want to use another, you must first update it in the Preacher Module`,
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
      //? Revisar y modificar aqui si es necesario
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
          `No se encontro Family Home, con el id ${their_family_home}`,
        );
      }

      if (!preacher) {
        throw new NotFoundException(
          `No se encontro Preacher, verifique que en Family Home tenga preacher asignado`,
        );
      }

      if (!copastor) {
        throw new NotFoundException(
          `No se encontro Copastor, verifique que en Family Home tenga copastor asignado`,
        );
      }

      if (!pastor) {
        throw new NotFoundException(
          `No se encontro Pastor, verifique que en Family Home tenga copastor asignado`,
        );
      }

      //? Revisar si es necesario o no
      const updateInfoMember = await this.memberRepository.preload({
        id: dataMember.id,
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
        their_family_home: null,
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

      try {
        await this.memberRepository.save(updateInfoMember);
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? NOW HERE THEY RAISE A LEVEL

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
      //! Cuando se sube de nivel un coapstor a pastor, en la tabla preacher se debe asignar un nuevo copastor (actualizar), revisar preacher actualizar
      //? En Preacher se actualiza el nuevo u otro copastor existente, y en Casa familiar se actualiza y jala las
      //? nuevas relaciones, haciendo el pasar casas a una zona o seteando el nuevo copastor que adopte todas esas casas
      //? con zonas
      //! En actualizar preacher se debe setear su copastor y pastor en Member tmb (ya lo hace)
      //* Search the preacher table and delete the relationship.

      //? Delete all same co-pastor relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const arrayPreachersByCopastor = allPreachers.filter(
        (preacher) => preacher.their_copastor.id === dataCopastor.id,
      );

      const promisesPreachers = arrayPreachersByCopastor.map(
        async (preacher) => {
          await this.preacherRepository.update(preacher.id, {
            their_copastor: null,
          });
        },
      );

      //! Ahora solo quedaria agregarle manualmente el copastor y de este sacar al pastor a cada Miembro en tabla miembro(Actualizar su casa)
      //! Su casa ya contiene preacher y este a su copastor y pastor. (TODO SIGUE UN ORDEN DE ACTUALIZAR)
      //? Delete all same co-pastor relationships in Member
      const allMembers = await this.memberRepository.find();
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_copastor.id === dataCopastor.id,
      );

      const promisesMembers = arrayMembersPreachers.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
        });
      });

      //! En la tabla family_home se debe actualizar al preacher para que agarre el nuevo copastor y pastor y este setea la casa en Member tmb
      //* Search the familyHome table and delete the relationship.
      const allFamilyHouses = await this.familyHomeRepository.find();
      const arrayHousesByCopastor = allFamilyHouses.filter(
        (home) => home.their_copastor.id === dataCopastor.id,
      );

      const promisesFamilyHouses = arrayHousesByCopastor.map(async (home) => {
        await this.familyHomeRepository.update(home.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
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
          `No se encontro Pastor con el ID ${their_pastor}`,
        );
      }

      //* Search the preacher table and eliminate the relationship (member, copastor and pastor)
      const allPreachers = await this.preacherRepository.find();
      const dataPreacher = allPreachers.find(
        (preacher) => preacher.id === dataMember.id,
      );

      const updatePreacher = await this.preacherRepository.preload({
        id: dataPreacher.id,
        member: null,
        their_copastor: null,
        their_pastor: null,
      });

      //! A la casa familiar se le debe avtualizar un nuevo preacher, y de este saca lo demas, y se setea en Member.
      //* Search the familyHome table and delete the relationship.
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHomePreacher = allFamilyHouses.find(
        (home) => home.their_preacher.id === dataMember.id,
      );

      const updateFamilyHome = await this.familyHomeRepository.preload({
        id: familyHomePreacher.id,
        their_preacher: null,
        their_copastor: null,
        their_pastor: null,
      });

      //! Individualmente en Member se asigna un nuevo Casa familiar o la misma a este Miembro, y como ya tiene la casa
      //! el preacher pastor y copastor, lo sete automativo (PROBAR)
      //? Delete all same co-pastor relationships in Member
      const allMembers = await this.memberRepository.find();
      const arrayMembersPreachers = allMembers.filter(
        (member) => member.their_preacher.id === dataPreacher.id,
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
      //! No deberia setearse casa_familiar, solo crear el nuevo preacher y desde casa familiar setear al preacher.
      // NOTE: hacer alerta de promover miembro a preacher e indicar que se cree una nueva casa para asignarlo desde casa familiar.

      if (!copastor) {
        throw new NotFoundException(
          `No se encontro coPastor con el ID ${their_copastor}`,
        );
      }

      if (!pastor) {
        throw new NotFoundException(
          `No se encontro Pastor con el ID ${copastor.their_pastor.id}`,
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
    // NOTE : recordar que despues de colocar inactivo, al actualizar el pastor se deb empezar por copastor, luego preacher y etc.
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
    //NOTE: para actualizar a un nuevo copastor, se empieza desde preacher y luego lo demas..
    //* Ver si al setear en un lugar en los demas se completa, por ejemplo si seteo un nuenvo copastor, si en casa familiar
    //* ese preacher ya tiene su copastor modificado.
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
            'their_pastor_id',
            'their_copastor_id',
            'their_preacher_id',
            'their_family_home_id',
          ],
        });

        if (members.length === 0) {
          throw new NotFoundException(
            `Not found member with these names: ${term}`,
          );
        }
        return members;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
      }
    }

    whereCondition[searchType] = term;
    whereCondition['is_active'] = true;

    const members = await this.memberRepository.find({
      where: [whereCondition],
      take: limit,
      skip: offset,
      relations: [
        'their_pastor_id',
        'their_copastor_id',
        'their_preacher_id',
        'their_family_home_id',
      ],
    });

    if (members.length === 0) {
      throw new NotFoundException(`Not found member with these names: ${term}`);
    }
    return members;
  }
}
