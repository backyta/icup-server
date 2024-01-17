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
import { CoPastor } from './entities/copastor.entity';

import { Pastor } from '../pastor/entities/pastor.entity';
import { Member } from '../members/entities/member.entity';
import { Preacher } from '../preacher/entities/preacher.entity';
import { FamilyHome } from '../family-home/entities/family-home.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { updateAge, searchPerson, searchFullname } from '../common/helpers';
import { SearchType } from '../common/enums/search-types.enum';
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
        `The id_member must have the role of "CoPastor"`,
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

    //* Creation instances
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
  async findAll(paginationDto: PaginationDto): Promise<CoPastor[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.coPastorRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<CoPastor[] | CoPastor> {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let coPastor: CoPastor | CoPastor[];

    //* Find ID --> One (active or inactive)
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.coPastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new BadRequestException(`Copastor was not found with this UUID`);
      }

      //* Count and assignment of Houses
      const familyHouses = await this.familyHomeRepository.find();
      const listFamilyHouses = familyHouses.filter(
        (home) => home.their_copastor?.id === term && home.is_active,
      );

      const familyHousesId = listFamilyHouses.map((houses) => houses.id);

      //* Counting and assigning Preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) =>
          preacher.their_copastor?.id === term && preacher.is_active,
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

    // TODO : agregar busqueda por nombre de pastor y member-copastor
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
          order: { created_at: 'ASC' },
        });

        if (coPastores.length === 0) {
          throw new NotFoundException(
            `Not found coPastores with these names: ${term}`,
          );
        }

        return coPastores;
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

    if (!coPastor)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return coPastor;
  }

  //NOTE: it is updated to is_active true, and it also sets updated data to CoPastor and Member ✅✅
  //* UPDATE FOR ID
  async update(
    id: string,
    updateCoPastorDto: UpdateCoPastorDto,
  ): Promise<CoPastor> {
    const { their_pastor, is_active } = updateCoPastorDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor not found with id: ${id}`);
    }

    //* Member assignment and validation
    const member = await this.memberRepository.findOneBy({
      id: dataCoPastor.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataCoPastor.member.id}`,
      );
    }

    //* Pastor assignment and validation
    const pastor = await this.pastorRepository.findOneBy({
      id: their_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //! it will only affect the co-pastor and his member-copastor.
    //* Update on all members the new pastor of the co-pastor that is updated.
    const allMembers = await this.memberRepository.find();
    const membersByCoPastor = allMembers.filter(
      (member) => member.their_copastor?.id === dataCoPastor.id,
    );

    const promisesMembers = membersByCoPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
        their_family_home: null,
      });
    });

    //* Update in all preachers the new pastor of the copastor that is updated.
    const allPreachers = await this.preacherRepository.find();
    const preachersByCoPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === dataCoPastor.id,
    );

    const promisesPreacher = preachersByCoPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_pastor: null,
        their_copastor: null,
        family_home: null,
        members: null,
      });
    });

    //* Update in all family homes the new co-pastor pastor that is updated.
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor?.id === dataCoPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_pastor: null,
          their_copastor: null,
          their_preacher: null,
          members: null,
        });
      },
    );

    //* Count and assignment of Houses
    const familyHouses = await this.familyHomeRepository.find();
    const listFamilyHouses = familyHouses.filter(
      (home) => home.their_copastor?.id === id,
    );

    const familyHousesId = listFamilyHouses.map((houses) => houses.id);

    //* Counting and assigning Preachers
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === id,
    );

    const listPreachersId = listPreachers.map((preacher) => preacher.id);

    //* Co-pastor their_pastor updated in Member-Module
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
      count_houses: listFamilyHouses.length,
      preachers: listPreachersId,
      count_preachers: listPreachers.length,
      member: dataMember,
      is_active: is_active,
      their_pastor: pastor,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(dataMember);
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
  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      their_pastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //* Update and set in false is_active on coPastor
    const coPastor = await this.coPastorRepository.preload({
      id: dataCoPastor.id,
      their_pastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    //* Update and set to null in Preacher
    const allPreachers = await this.preacherRepository.find();
    const preachersByPastor = allPreachers.filter(
      (preacher) => preacher.their_copastor?.id === dataCoPastor.id,
    );

    const promisesPreacher = preachersByPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_copastor: null,
        their_pastor: null,
        family_home: null,
        members: null,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
      });
    });

    //* Update and set to null in Family Home
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_copastor?.id === coPastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
          members: null,
          updated_at: new Date(),
          updated_by: 'Kevinxd',
        });
      },
    );

    //* Update and set to null in Member, all those who have the same coPastor
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });
    const membersByPastor = allMembers.filter(
      (member) => member.their_copastor?.id === dataCoPastor.id,
    );

    const promisesMembers = membersByPastor.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
        their_family_home: !member.their_preacher
          ? null
          : member.their_family_home,
        updated_at: new Date(),
        updated_by: 'Kevinxd',
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
  //* For future index errors or constrains with code.
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
  ): Promise<CoPastor | CoPastor[]> => {
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
        throw new NotFoundException(
          `Not found member with role Copastor and with this name : ${term.slice(
            0,
            -1,
          )}`,
        );
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
          `Not found Copastor with these names ${term.slice(0, -1)}`,
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
        throw new NotFoundException(
          `Not found member with role Copastor and with these first_name & last_name: ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
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
          `Not found CoPastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }
  };
}
