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

import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';
import { Preacher } from './entities/preacher.entity';

import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { FamilyHome } from '../family-home/entities/family-home.entity';
import { User } from '../users/entities/user.entity';

import { SearchType } from '../common/enums/search-types.enum';
import { searchFullname, searchPerson, updateAge } from '../common/helpers';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

@Injectable()
export class PreacherService {
  private readonly logger = new Logger('PreacherService');

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

  //* CREATE PREACHER
  async create(createPreacherDto: CreatePreacherDto, user: User) {
    const { member_id, their_copastor } = createPreacherDto;

    const member = await this.memberRepository.findOneBy({
      id: member_id,
    });

    if (!member) {
      throw new NotFoundException(`Not found Member with id ${member_id}`);
    }

    if (!member.roles.includes('preacher')) {
      throw new BadRequestException(
        `The id_member must have the role of "Preacher"`,
      );
    }

    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${their_copastor}`,
      );
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    if (!copastor.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    //* Creation instances
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      their_pastor: pastor,
      their_copastor: copastor,
    });

    try {
      const preacherInstance = this.preacherRepository.create({
        member: member,
        their_pastor: pastor,
        their_copastor: copastor,
        created_at: new Date(),
        created_by: user,
      });

      await this.memberRepository.save(dataMember);
      return await this.preacherRepository.save(preacherInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Preacher[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.preacherRepository.find({
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY TERM AND SEARCH TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Preacher | Preacher[]> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let preacher: Preacher | Preacher[];

    //* Find ID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      preacher = await this.preacherRepository.findOneBy({ id: term });

      if (!preacher) {
        throw new NotFoundException(`Preacher was not found with this UUID`);
      }

      //* Counting and assigning the number of members (id-preacher member table)
      const allMembers = await this.memberRepository.find({
        relations: ['their_preacher'],
      });

      const membersOfPreacher = allMembers.filter(
        (members) => members.their_preacher?.id === term,
      );

      const listMembersID = membersOfPreacher.map(
        (copastores) => copastores.id,
      );

      //* House ID assignment according to Preacher ID
      const familyHouses = await this.familyHomeRepository.find();
      const familyHome = familyHouses.find(
        (home) => home.their_preacher.id === term,
      );

      preacher.count_members = listMembersID.length;
      preacher.members = listMembersID;

      preacher.family_home = [familyHome.id];

      //* Update age, when querying by ID
      preacher.member.age = updateAge(preacher.member);

      await this.preacherRepository.save(preacher);
    }

    //! Search Preachers by Preacher or Copastor names
    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await this.searchPreacherBy(
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
      const resultSearch = await this.searchPreacherBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find fullName --> One
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await this.searchPreacherBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        type_of_name,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find CoPastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      preacher = await this.preacherRepository
        .createQueryBuilder('preacher')
        .leftJoinAndSelect('preacher.member', 'rel1')
        .leftJoinAndSelect('preacher.their_pastor', 'rel2')
        .leftJoinAndSelect('preacher.their_copastor', 'rel3')
        .where('preacher.their_copastor =:term', { term })
        .andWhere('preacher.is_active =:isActive', { isActive: true })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (preacher.length === 0) {
        throw new NotFoundException(
          `No Preacher was found with this their_copastor: ${term}`,
        );
      }
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const preachers = await this.preacherRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { created_at: 'ASC' },
        });

        if (preachers.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with this term: ${term}`,
          );
        }
        return preachers;
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

    if (
      term &&
      (type === SearchType.firstName ||
        type === SearchType.lastName ||
        type === SearchType.fullName) &&
      !type_of_name
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (!preacher)
      throw new NotFoundException(`CoPastor with this ${term} not found`);

    return preacher;
  }

  //NOTE: it is updated to is_active true, and it also sets updated data to Preacher and Member ✅✅
  //* UPDATE PREACHER
  async update(
    id: string,
    updatePreacherDto: UpdatePreacherDto,
    user: User,
  ): Promise<Preacher> {
    const { their_copastor, is_active, member_id } = updatePreacherDto;

    if (!member_id) {
      throw new BadRequestException(
        `member_id should not be sent, member id cannot be updated`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    //* Member assignment and validation
    const dataMember = await this.memberRepository.findOneBy({
      id: dataPreacher.member.id,
    });

    if (!dataMember) {
      throw new NotFoundException(
        `Member not found with id ${dataPreacher.member.id}`,
      );
    }

    //* Copastor assignment and validation
    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(`Pastor not found with id ${their_copastor}`);
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value`,
      );
    }

    //* Pastor Assignment and Validation, according to the co-Pastor.
    if (!copastor.their_pastor) {
      throw new NotFoundException(
        `Pastor was not found, verify that Copastor has a pastor assigned`,
      );
    }

    const pastor = await this.pastorRepository.findOneBy({
      id: copastor.their_pastor.id,
    });

    if (!pastor?.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value`,
      );
    }

    //* Setear a null si el copastor es diferente, porque el preacher cambio de zona (copastor)
    const allMembers = await this.memberRepository.find();
    const membersByPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      if (member.their_copastor.id !== copastor.id) {
        await this.memberRepository.update(member.id, {
          their_copastor: null,
          their_pastor: null,
          their_preacher: null,
        });
      }
    });

    //* If you find a house with the preacher and your co-pastor is different from the one we want to update (delete relationships)
    const allFamilyHouses = await this.familyHomeRepository.find();
    const dataFamilyHomeByPreacher = allFamilyHouses.find(
      (home) => home.their_preacher?.id === dataPreacher.id,
    );

    let updateFamilyHome: FamilyHome;
    if (
      dataFamilyHomeByPreacher &&
      (dataFamilyHomeByPreacher?.their_copastor?.id !== copastor.id ||
        dataFamilyHomeByPreacher?.their_pastor?.id !== pastor.id)
    ) {
      updateFamilyHome = await this.familyHomeRepository.preload({
        id: dataFamilyHomeByPreacher?.id,
        their_preacher: null,
        their_copastor: null,
        their_pastor: null,
      });
    }

    //* Counting and assigning the number of members (id-preacher member table)
    const membersPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataPreacher.id,
    );

    const listMembersID = membersPreacher.map((preacher) => preacher.id);

    //* House ID assignment when searching for Preacher
    const familyHouses = await this.familyHomeRepository.find();
    const familyHome = familyHouses.filter(
      (home) => home.their_preacher?.id === dataPreacher.id,
    );

    const familyHomeId = familyHome.map((home) => home.id);

    //* Update Preacher and Member-Preacher, their_co-pastor and their_pastor.
    try {
      const member = await this.memberRepository.preload({
        id: dataMember.id,
        ...updatePreacherDto,
        their_pastor: pastor,
        their_copastor: copastor,
        their_family_home:
          dataMember.their_copastor?.id !== copastor.id
            ? null
            : dataMember.their_family_home,
        is_active: is_active,
        updated_at: new Date(),
        updated_by: user,
      });

      await this.memberRepository.save(member);

      const preacher = await this.preacherRepository.preload({
        id: dataPreacher.id,
        member: dataMember,
        their_pastor: pastor,
        their_copastor: copastor,
        members: listMembersID,
        count_members: listMembersID.length,
        family_home: familyHomeId,
        is_active: is_active,
        updated_at: new Date(),
        updated_by: user,
      });

      await this.preacherRepository.save(preacher);
      updateFamilyHome &&
        (await this.familyHomeRepository.save(updateFamilyHome));
      await Promise.all(promisesMembers);

      return preacher;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataPreacher.member.id,
      their_copastor: null,
      their_pastor: null,
      their_family_home: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set in false is_active on Preacher
    const preacher = await this.preacherRepository.preload({
      id: dataPreacher.id,
      their_pastor: null,
      their_copastor: null,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set to null in Family Home
    const allFamilyHouses = await this.familyHomeRepository.find();
    const familyHousesByPreacher = allFamilyHouses.filter(
      (familyHome) => familyHome.their_preacher?.id === preacher.id,
    );

    const promisesFamilyHouses = familyHousesByPreacher.map(
      async (familyHome) => {
        await this.familyHomeRepository.update(familyHome.id, {
          their_preacher: null,
          their_pastor: null,
          their_copastor: null,
          updated_at: new Date(),
          updated_by: user,
        });
      },
    );

    //* Update and set to null in Member, all those who have the same Preacher
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });
    const membersByPreacher = allMembers.filter(
      (member) => member.their_preacher?.id === dataPreacher.id,
    );

    const promisesMembers = membersByPreacher.map(async (member) => {
      await this.memberRepository.update(member.id, {
        their_preacher: null,
        their_pastor: null,
        their_copastor: null,
        updated_at: new Date(),
        updated_by: user,
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

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  private searchPreacherBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    type_of_name: string,
    repository: Repository<Member>,
  ): Promise<Preacher | Preacher[]> => {
    //! For find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const preachers = await this.preacherRepository.find();

      let preachersByName: Preacher[][];
      if (type_of_name === 'preacher-member') {
        preachersByName = members.map((member) => {
          const newPreachers = preachers.filter(
            (preacher) =>
              preacher?.member.id === member.id && preacher?.is_active === true,
          );
          return newPreachers;
        });
      }

      if (type_of_name === 'copastor') {
        preachersByName = members.map((member) => {
          const newPreachers = preachers.filter(
            (preacher) =>
              preacher?.their_copastor?.member.id === member.id &&
              preacher?.is_active === true,
          );
          return newPreachers;
        });
      }

      if (!preachersByName) {
        throw new NotFoundException(
          `Not found Preacher with this names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      const ArrayPreachersFlattened = preachersByName.flat();

      if (ArrayPreachersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preacher with these names of '${type_of_name}': ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayPreachersFlattened;
    }

    //! For find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const preachers = await this.preacherRepository.find();

      let preachersByName: Preacher[][];
      if (type_of_name === 'preacher-member') {
        preachersByName = members.map((member) => {
          const newPreachers = preachers.filter(
            (preacher) =>
              preacher?.member?.id === member.id && preacher.is_active === true,
          );
          return newPreachers;
        });
      }

      if (type_of_name === 'copastor') {
        preachersByName = members.map((member) => {
          const newPreachers = preachers.filter(
            (preacher) =>
              preacher?.their_copastor?.member.id === member.id &&
              preacher.is_active === true,
          );
          return newPreachers;
        });
      }

      if (!preachersByName) {
        throw new NotFoundException(
          `Not found Preachers with these first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      const ArrayPreachersFlattened = preachersByName.flat();

      if (ArrayPreachersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these  first_name & last_name of '${type_of_name}': ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPreachersFlattened;
    }
  };
}
