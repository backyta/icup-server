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

  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const {
      roles,
      their_pastor,
      their_copastor,
      their_preacher,
      their_family_home,
    } = createMemberDto;

    //* Role validation (only 1 and member)
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

    //* Only a Preacher can serve as Treasurer
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

    //* Validations assignment of their leaders according to role
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
        `A Copastor, Preacher or Family House cannot be assigned to a member with a Copastor role, only their_pastor can be assigned`,
      );
    }

    if (
      (roles.includes('preacher') && their_pastor) ||
      (roles.includes('preacher') && their_preacher) ||
      (roles.includes('preacher') && their_family_home)
    ) {
      throw new BadRequestException(
        `Cannot assign a Pastor, Preacher, or Family Home to a member with Preacher role, only their_copastor can be assigned`,
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

    //* Validations Pastor, Copastor, Preacher, Family-Home.
    let pastor: Pastor;
    let copastor: CoPastor;
    let preacher: Preacher;
    let familyHome: FamilyHome;

    //! If no relationship is sent and the role is 'pastor', create member and pastor.
    if (roles.includes('pastor')) {
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

        await this.pastorService.create({
          member_id: member.id,
        });

        return member;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! If their_pastor exists and the role is 'copastor', create member and copastor.
    if (their_pastor && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });

      if (!pastor) {
        throw new NotFoundException(
          `Pastor was not found with id ${their_pastor}`,
        );
      }

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

        await this.coPastorService.create({
          member_id: member.id,
          their_pastor: pastor.id,
        });

        return member;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! If their_copastor exists and the role is 'preacher', create member and preacher.
    if (their_copastor && roles.includes('preacher')) {
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });

      if (!copastor) {
        throw new NotFoundException(
          `CoPastor was not found with id ${their_copastor}`,
        );
      }

      if (!copastor.their_pastor) {
        throw new NotFoundException(
          `Pastor was not found, verify that Copastor has a pastor assigned`,
        );
      }
      pastor = await this.pastorRepository.findOneBy({
        id: copastor?.their_pastor.id,
      });

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

        await this.preacherService.create({
          member_id: member.id,
          their_copastor: copastor.id,
        });

        return member;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //! If their_familyHome exists and their role is just 'member', create just member.
    if (their_family_home && roles.includes('member')) {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });

      if (!familyHome) {
        throw new NotFoundException(
          `Family-Home was not found with id ${their_family_home}`,
        );
      }

      if (!familyHome.their_preacher) {
        throw new NotFoundException(
          `Preacher was not found, verify that FamilyHome has a preacher assigned`,
        );
      }

      preacher = await this.preacherRepository.findOneBy({
        id: familyHome.their_preacher.id,
      });

      if (!familyHome.their_copastor) {
        throw new NotFoundException(
          `CoPastor was not found, verify that FamilyHome has a copastor assigned`,
        );
      }

      copastor = await this.coPastorRepository.findOneBy({
        id: familyHome.their_copastor.id,
      });

      if (!familyHome.their_pastor) {
        throw new NotFoundException(
          `Pastor was not found, verify that FamilyHome has a pastor assigned`,
        );
      }
      pastor = await this.pastorRepository.findOneBy({
        id: familyHome.their_pastor.id,
      });

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

    //! If no relationship is sent, create only member without relationships.
    if (!their_pastor && !their_copastor && !their_preacher) {
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
  ): Promise<Member[] | Member> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let member: Member | Member[];

    //* Find UUID --> One (inactive or active)
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
        throw new NotFoundException(`Pastor was not found with this UUID`);
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
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await this.searchMemberBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await this.searchMemberBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find fullName --> Many
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await this.searchMemberBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
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
        throw new NotFoundException(
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
        throw new NotFoundException(
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
        throw new NotFoundException(
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
        throw new NotFoundException(
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

    if (
      term &&
      (SearchType.firstName || SearchType.lastName || SearchType.fullName) &&
      !type_of_name
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

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

    if (!roles) {
      throw new BadRequestException(
        `Required assign roles to update the member`,
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

    //* Validation when updating roles (of the member), they cannot be lower.
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

    //* If a member wants to become a pastor or co-pastor without first becoming a preacher
    if (
      dataMember.roles.includes('member') &&
      !dataMember.roles.includes('preacher') &&
      !dataMember.roles.includes('copastor') &&
      !dataMember.roles.includes('pastor') &&
      (roles.includes('copastor') || roles.includes('pastor'))
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

    //NOTE: it is updated to is_active true, and it also sets updated data to Member and Pastor ✅✅
    //! Pastor Validation (If pastor remains in pastor role)
    if (dataMember.roles.includes('pastor') && roles.includes('pastor')) {
      pastor = null;
      copastor = null;
      preacher = null;
      familyHome = null;

      if (dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update it to false, you must delete the registry`,
        );
      }

      if (!dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update is_active to false because it is already false`,
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

      const allPastores = await this.pastorRepository.find();
      const dataPastor = allPastores.find(
        (pastor) => pastor.member.id === member.id,
      );

      const updatePastor = await this.pastorRepository.preload({
        id: dataPastor.id,
        is_active: updateMemberDto.is_active,
        member: member,
      });

      try {
        await this.pastorRepository.save(updatePastor);
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //NOTE: it is updated to is_active true, and it also sets updated data to Member and Copastor ✅✅
    //! CoPastor Validation (If copastor remains in copastor role)
    if (dataMember.roles.includes('copastor') && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;

      if (dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update it to false, you must delete the registry`,
        );
      }

      if (!dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update is_active to false because it is already false`,
        );
      }

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
      const allPreachers = await this.preacherRepository.find();
      const arrayPreachersByCopastor = allPreachers.filter(
        (preacher) => preacher.their_copastor?.id === dataCopastor.id,
      );

      const promisesPreachers = arrayPreachersByCopastor.map(
        async (preacher) => {
          await this.preacherRepository.update(preacher.id, {
            their_pastor: pastor,
          });
        },
      );

      //* Change pastors in Member to all those who have the same co-pastor
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

      //* Search the table for family home according to copastor and set the new pastor.
      const allFamilyHouses = await this.familyHomeRepository.find();

      const arrayHousesByCopastor = allFamilyHouses.filter(
        (home) => home.their_copastor?.id === dataCopastor.id,
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
        is_active: updateMemberDto.is_active,
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

    //NOTE: it is updated to is_active true, and it also sets updated data to Member and Preacher, and a temporary home is placed on the preacher without a home ✅✅
    //! Preacher Validation (If preacher remains in preacher role)
    if (dataMember.roles.includes('preacher') && roles.includes('preacher')) {
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });

      if (dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update it to false, you must delete the registry`,
        );
      }

      if (!dataMember.is_active && !is_active) {
        throw new BadRequestException(
          `You cannot update is_active to false because it is already false`,
        );
      }

      if (!copastor) {
        throw new NotFoundException(
          `Pastor was not found with the ID ${their_copastor}`,
        );
      }

      if (!copastor.their_pastor) {
        throw new NotFoundException(
          `Pastor was not found, verify that Copastor has a pastor assigned`,
        );
      }

      pastor = await this.pastorRepository.findOneBy({
        id: copastor.their_pastor.id,
      });

      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });

      if (!familyHome) {
        throw new NotFoundException(
          `Family_Home was not found with the ID ${their_family_home}`,
        );
      }

      if (dataMember.their_family_home && their_family_home) {
        throw new BadRequestException(
          `No se puede colocar un nuevo their_family_home, porque ya existe uno`,
        );
      }

      //! Valdidation if family_home exists and you want to assign a different co-pastor
      if (
        dataMember.their_family_home &&
        dataMember.their_copastor?.id !== copastor.id &&
        dataMember.their_pastor?.id !== pastor.id
      ) {
        throw new BadRequestException(
          `You cannot change their_copastor to a Preacher-Member assigned to a Family House: ${dataMember.their_family_home.code}, Copastor: ${dataMember.their_family_home.their_copastor.member.first_name} ${dataMember.their_family_home.their_copastor.member.last_name}, if you want to change first update their_copastor in the Preacher Module`,
        );
      }

      //* If it exists and the co-pastor is the same, the same data is set (only modify the rest)
      if (
        dataMember.their_family_home &&
        dataMember.their_copastor.id === copastor.id &&
        dataMember.their_pastor.id === pastor.id &&
        dataMember.is_active
      ) {
        member = await this.memberRepository.preload({
          id: dataMember.id,
          ...updateMemberDto,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
          their_pastor: pastor,
          their_copastor: copastor,
          their_preacher: null,
          their_family_home: dataMember.their_family_home,
        });
      }

      //! Temporary house setting for the preacher without home, as long as his house is in the same area as his co-pastor
      if (
        dataMember.their_family_home === null &&
        dataMember.their_copastor &&
        dataMember.is_active
      ) {
        if (familyHome.their_copastor?.id === copastor.id) {
          member = await this.memberRepository.preload({
            id: dataMember.id,
            ...updateMemberDto,
            updated_at: new Date(),
            updated_by: 'Kevinxd',
            their_pastor: pastor,
            their_copastor: copastor,
            their_preacher: null,
            their_family_home: familyHome,
          });
        } else {
          throw new BadRequestException(
            `A temporary family home must be assigned that is within the co-pastor's area, check if family_home has a co-pastor assigned`,
          );
        }
      }

      //! When you want to set the is_active to true, and set a new co-shepherd and shepherd.
      if (
        dataMember.their_family_home === null &&
        dataMember.their_copastor === null &&
        dataMember.their_pastor === null &&
        !dataMember.is_active
      ) {
        member = await this.memberRepository.preload({
          id: dataMember.id,
          ...updateMemberDto,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
          their_pastor: pastor,
          their_copastor: copastor,
          their_preacher: null,
          their_family_home: null,
        });
      }

      const allPreachers = await this.preacherRepository.find();
      const dataPreacher = allPreachers.find(
        (preacher) => preacher.member.id === dataMember.id,
      );

      const updatePreacherMember = await this.preacherRepository.preload({
        id: dataPreacher.id,
        member: member,
        is_active: updateMemberDto.is_active,
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

    //NOTE: it is updated to is_active true, and it also sets updated data to Member ✅✅
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

      if (!familyHome) {
        throw new NotFoundException(
          `Family Home was not found, with the id ${their_family_home}`,
        );
      }

      if (!familyHome.their_preacher) {
        throw new NotFoundException(
          `Preacher was not found, verify that Family Home has a preacher assigned`,
        );
      }

      if (!familyHome.their_copastor) {
        throw new NotFoundException(
          `Copastor was not found, verify that Family Home has a copastor assigned`,
        );
      }

      if (!familyHome.their_pastor) {
        throw new NotFoundException(
          `Pastor was not found, verify that Family Home has a co-pastor assigned`,
        );
      }

      preacher = await this.preacherRepository.findOneBy({
        id: familyHome.their_preacher.id,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: familyHome.their_copastor.id,
      });
      pastor = await this.pastorRepository.findOneBy({
        id: familyHome.their_pastor.id,
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
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //? NOW HERE THEY RAISE A LEVEL

    //! Validation If co-pastor rises to Pastor role
    if (
      dataMember.roles.includes('copastor') &&
      roles.includes('pastor') &&
      dataMember.is_active
    ) {
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

      //* Search and Delete all same co-pastor relationships in Preacher
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

      //* Delete all same co-pastor relationships in Member
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

      //* Eliminate the Copastor who rose to pastor, assign the new role to the member and create the new pastor.
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
          member_id: dataMember.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      throw new BadRequestException(
        `Can't level up, you must have is_active to true and check if your_pastor, your_co-pastor, your_preacher should exist`,
      );
    }

    //! Validation If preacher rises to Copastor
    if (
      dataMember.roles.includes('preacher') &&
      roles.includes('copastor') &&
      dataMember.is_active
    ) {
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

      //* Delete all same preacher relationships in Member
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

      //* Delete the Preacher who uploaded Copastor, assign the new role to the member and create the new Copastor
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
          member_id: dataMember.id,
          their_pastor: pastor.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      throw new BadRequestException(
        `Cannot level up, you must have is_active to true and check if your_pastor, your_co-pastor, your_preacher should exist`,
      );
    }

    //! If a Member transforms into a Preacher
    if (
      dataMember.roles.includes('member') &&
      !dataMember.roles.includes('preacher') &&
      roles.includes('preacher') &&
      dataMember.is_active
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
          member_id: dataMember.id,
          their_copastor: copastor.id,
        });
        return result;
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      throw new BadRequestException(
        `Can't level up, you must have is_active to true and check if their_pastor, their_copastor, their_preacher should exist`,
      );
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

    //* Delete all member relations.
    const member = await this.memberRepository.preload({
      id: dataMember.id,
      updated_at: new Date(),
      updated_by: 'Kevin',
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

      //* Update and set is_active false in Pastor
      const pastor = await this.pastorRepository.preload({
        id: pastorMember.id,
        is_active: false,
        updated_at: new Date(),
        updated_by: 'Kevin',
      });

      //* Update and set to null relationships in Copastor
      const allCopastores = await this.coPastorRepository.find();
      const copastoresByPastor = allCopastores.filter(
        (copastor) => copastor.their_pastor?.id === pastorMember.id,
      );

      const promisesCopastor = copastoresByPastor.map(async (copastor) => {
        await this.coPastorRepository.update(copastor.id, {
          their_pastor: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
        });
      });

      //* Update and set to null relationships in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByPastor = allPreachers.filter(
        (preacher) => preacher.their_pastor?.id === pastorMember.id,
      );

      const promisesPreacher = preachersByPastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          their_pastor: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
        });
      });

      //* Update and set to null relationships in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_pastor?.id === pastorMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_pastor: null,
            their_copastor: null,
            updated_at: new Date(),
            updated_by: 'Kevin',
          });
        },
      );

      //* Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find({
        relations: ['their_pastor'],
      });

      const membersByPastor = allMembers.filter(
        (member) => member.their_pastor?.id === pastorMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_pastor: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
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
      dataMember.roles.includes('copastor') &&
      dataMember.roles.includes('member')
    ) {
      const coPastores = await this.coPastorRepository.find();
      const coPastorMember = coPastores.find(
        (coPastor) => coPastor.member.id === id,
      );

      if (!coPastorMember) {
        throw new NotFoundException(`Not found copastor`);
      }

      //* Update and set null in CoPastor
      const copastor = await this.coPastorRepository.preload({
        id: coPastorMember.id,
        updated_at: new Date(),
        updated_by: 'Kevin',
        their_pastor: null,
        is_active: false,
      });

      //* Update and set to null in Preacher
      const allPreachers = await this.preacherRepository.find();
      const preachersByPastor = allPreachers.filter(
        (preacher) => preacher.their_copastor?.id === coPastorMember.id,
      );

      const promisesPreacher = preachersByPastor.map(async (preacher) => {
        await this.preacherRepository.update(preacher.id, {
          their_copastor: null,
          their_pastor: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
        });
      });

      //* Update and set to null in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_copastor?.id === coPastorMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_copastor: null,
            their_pastor: null,
            their_preacher: null,
            updated_at: new Date(),
            updated_by: 'Kevin',
          });
        },
      );

      //* Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find({
        relations: ['their_copastor'],
      });
      const membersByPastor = allMembers.filter(
        (member) => member.their_copastor?.id === coPastorMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
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
      dataMember.roles.includes('preacher') &&
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
        updated_at: new Date(),
        updated_by: 'Kevin',
      });

      //* Update and set to null in Family Home
      const allFamilyHouses = await this.familyHomeRepository.find();
      const familyHousesByPastor = allFamilyHouses.filter(
        (familyHome) => familyHome.their_preacher?.id === preacherMember.id,
      );

      const promisesFamilyHouses = familyHousesByPastor.map(
        async (familyHome) => {
          await this.familyHomeRepository.update(familyHome.id, {
            their_preacher: null,
            their_pastor: null,
            their_copastor: null,
            updated_at: new Date(),
            updated_by: 'Kevin',
          });
        },
      );

      //* Update and set to null in Member, all those who have the same Pastor
      const allMembers = await this.memberRepository.find({
        relations: ['their_preacher'],
      });
      const membersByPastor = allMembers.filter(
        (member) => member.their_preacher?.id === preacherMember.id,
      );

      const promisesMembers = membersByPastor.map(async (member) => {
        await this.memberRepository.update(member.id, {
          their_preacher: null,
          their_pastor: null,
          their_copastor: null,
          updated_at: new Date(),
          updated_by: 'Kevin',
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

  private searchMemberBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    type_of_name: string,
    repository: Repository<Member>,
  ): Promise<Member | Member[]> => {
    //! For find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const allMembers = await this.memberRepository.find({
        relations: [
          'their_pastor',
          'their_copastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      let membersByName: Member[][];

      if (type_of_name === 'preacher') {
        const preacherMembers = members.filter((member) =>
          member.roles.includes('preacher'),
        );

        membersByName = preacherMembers.map((memberPreacher) => {
          const newMembersByPreacher = allMembers.filter(
            (member) =>
              member?.their_preacher?.member.id === memberPreacher.id &&
              member.is_active === true,
          );
          return newMembersByPreacher;
        });
      }

      if (type_of_name === 'copastor') {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('copastor'),
        );

        membersByName = copastorMembers.map((memberCopastor) => {
          const newMembersByCopastor = allMembers.filter(
            (member) =>
              member?.their_copastor?.member.id === memberCopastor.id &&
              member.is_active === true,
          );

          return newMembersByCopastor;
        });
      }

      if (type_of_name === 'member') {
        return members;
      }

      if (!membersByName) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayMembersFlattened = membersByName.flat();

      if (ArrayMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayMembersFlattened;
    }

    //! For find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const allMembers = await this.memberRepository.find({
        relations: [
          'their_pastor',
          'their_copastor',
          'their_preacher',
          'their_family_home',
        ],
      });

      let membersByName: Member[][];

      if (type_of_name === 'preacher') {
        const preacherMembers = members.filter((member) =>
          member.roles.includes('preacher'),
        );

        membersByName = preacherMembers.map((memberPreacher) => {
          const newMembersByPreacher = allMembers.filter(
            (member) =>
              member?.their_preacher?.member.id === memberPreacher.id &&
              member.is_active === true,
          );

          return newMembersByPreacher;
        });
      }

      if (type_of_name === 'copastor') {
        const copastorMembers = members.filter((member) =>
          member.roles.includes('copastor'),
        );

        membersByName = copastorMembers.map((memberCopastor) => {
          const newMembersByCopastor = allMembers.filter(
            (member) =>
              member?.their_copastor?.member.id === memberCopastor.id &&
              member.is_active === true,
          );
          return newMembersByCopastor;
        });
      }

      if (type_of_name === 'member') {
        return members;
      }

      if (!membersByName) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayMembersFlattened = membersByName.flat();

      if (ArrayMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Members with these names of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayMembersFlattened;
    }
  };
}
