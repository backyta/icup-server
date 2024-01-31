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

import { Pastor } from './entities/pastor.entity';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';

import { Member } from '../members/entities/member.entity';
import { CoPastor } from '../copastors/entities/copastor.entity';
import { Preacher } from '../preachers/entities/preacher.entity';
import { FamilyHouse } from '../family-houses/entities/family-house.entity';
import { User } from '../users/entities/user.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { SearchType, TypeEntity, SearchTypeOfName } from '../common/enums';
import { updateAge, searchPeopleBy } from '../common/helpers';

@Injectable()
export class PastorsService {
  private readonly logger = new Logger('PastorsService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE PASTOR
  async create(createPastorDto: CreatePastorDto, user: User): Promise<Pastor> {
    const { member_id } = createPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: member_id,
    });

    if (!member) {
      throw new NotFoundException(`Not found Member with id ${member_id}`);
    }

    if (!member.roles.includes('pastor')) {
      throw new BadRequestException(
        `The id_member must have the role of "Shepherd"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    //* Creation instances
    try {
      const pastorInstance = this.pastorRepository.create({
        member: member,
        created_at: new Date(),
        created_by: user,
      });

      return await this.pastorRepository.save(pastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Pastor[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.pastorRepository.find({
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
  ): Promise<Pastor | Pastor[]> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let pastor: Pastor | Pastor[];

    //* Find ID --> One (active or inactive)
    if (isUUID(term) && type === SearchType.id) {
      pastor = await this.pastorRepository.findOne({
        where: { id: term },
      });

      if (!pastor) {
        throw new NotFoundException(`Pastor was not found with this UUID`);
      }

      //* Count and assignment of co-pastors
      const allCopastores = await this.coPastorRepository.find();
      const listCopastores = allCopastores.filter(
        (copastor) => copastor.their_pastor?.id === term && copastor.is_active,
      );

      const listCopastoresID = listCopastores.map(
        (copastores) => copastores.id,
      );

      //* Count and assignment of preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.their_pastor?.id === term && preacher.is_active,
      );

      const listPreachersID = listPreachers.map((copastores) => copastores.id);

      pastor.count_copastores = listCopastores.length;
      pastor.copastores_id = listCopastoresID;

      pastor.preachers_id = listPreachersID;
      pastor.count_preachers = listPreachers.length;

      //* Update age, when querying by ID
      pastor.member.age = updateAge(pastor.member);

      await this.pastorRepository.save(pastor);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.pastorRepository,
      });

      return resultSearch;
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.lastName,
        limit,
        offset,
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.pastorRepository,
      });

      return resultSearch;
    }

    //* Find fullName --> One
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.fullName,
        limit,
        offset,
        type_entity: TypeEntity.pastorEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.pastorRepository,
      });

      return resultSearch;
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const pastores = await this.pastorRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { created_at: 'ASC' },
        });

        if (pastores.length === 0) {
          throw new NotFoundException(
            `Not found Pastores with this term: ${term}`,
          );
        }

        return pastores;
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
      (SearchType.firstName || SearchType.lastName || SearchType.fullName)
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (type_of_name && type_of_name !== SearchTypeOfName.pastorMember) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.pastorMember}`,
      );
    }

    if (!pastor) throw new NotFoundException(`Pastor with ${term} not found`);

    return pastor;
  }

  //NOTE: is updated to is_active true, and also sets updated data to Pastor and Member  ✅✅
  //* UPDATE FOR ID
  async update(
    id: string,
    updatePastorDto: UpdatePastorDto,
    user: User,
  ): Promise<Pastor> {
    const { is_active, member_id } = updatePastorDto;

    if (!member_id) {
      throw new BadRequestException(
        `member_id should not be sent, member id cannot be updated`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor not found with id: ${id}`);
    }

    //* Find Member for update.
    const member = await this.memberRepository.findOneBy({
      id: dataPastor.member.id,
    });

    if (!member) {
      throw new NotFoundException(
        `Member not found with id ${dataPastor.member.id}`,
      );
    }

    //* Count of co-pastors
    const allCopastores = await this.coPastorRepository.find();
    const listCopastores = allCopastores.filter(
      (copastor) => copastor.their_pastor?.id === dataPastor.id,
    );

    const listCopastoresID = listCopastores.map((copastores) => copastores.id);

    //* Count and assignment of preachers
    const allPreachers = await this.preacherRepository.find();
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_pastor?.id === dataPastor.id,
    );

    const listPreachersID = listPreachers.map((preacher) => preacher.id);

    //* Pastor data updated in Member-Module and Pastor-Module
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updatePastorDto,
      is_active: is_active,
      updated_at: new Date(),
      updated_by: user,
    });

    const pastor = await this.pastorRepository.preload({
      id: id,
      member: dataMember,
      count_copastores: listCopastores.length,
      copastores_id: listCopastoresID,
      count_preachers: listPreachers.length,
      preachers_id: listPreachersID,
      is_active: is_active,
      updated_at: new Date(),
      updated_by: user,
    });

    try {
      await this.memberRepository.save(dataMember);
      return await this.pastorRepository.save(pastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* DELETE FOR ID
  async remove(id: string, user: User): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor with id: ${id} not exits`);
    }

    //* Update and set in false is_active on Member
    const member = await this.memberRepository.preload({
      id: dataPastor.member.id,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set in false is_active on Pastor
    const pastor = await this.pastorRepository.preload({
      id: dataPastor.id,
      is_active: false,
      updated_at: new Date(),
      updated_by: user,
    });

    //* Update and set to null relationships in Copastor
    const allCopastores = await this.coPastorRepository.find();
    const copastoresByPastor = allCopastores.filter(
      (copastor) => copastor.their_pastor?.id === dataPastor.id,
    );

    const promisesCopastor = copastoresByPastor.map(async (copastor) => {
      await this.coPastorRepository.update(copastor.id, {
        their_pastor: null,
        updated_at: new Date(),
        updated_by: user,
      });
    });

    //* Update and set to null relationships in Preacher
    const allPreachers = await this.preacherRepository.find();
    const preachersByPastor = allPreachers.filter(
      (preacher) => preacher.their_pastor?.id === dataPastor.id,
    );

    const promisesPreacher = preachersByPastor.map(async (preacher) => {
      await this.preacherRepository.update(preacher.id, {
        their_pastor: null,
        their_copastor: null,
        updated_at: new Date(),
        updated_by: user,
      });
    });

    //* Update and set to null relationships in Family Home
    const allFamilyHouses = await this.familyHouseRepository.find();
    const familyHousesByPastor = allFamilyHouses.filter(
      (familyHome) => familyHome.their_pastor?.id === pastor.id,
    );

    const promisesFamilyHouses = familyHousesByPastor.map(
      async (familyHome) => {
        await this.familyHouseRepository.update(familyHome.id, {
          their_pastor: null,
          their_copastor: null,
          their_preacher: null,
          updated_at: new Date(),
          updated_by: user,
        });
      },
    );

    //* Update and set to null relationships in Member, all those who have the same Pastor.
    const allMembers = await this.memberRepository.find({
      relations: [
        'their_pastor',
        'their_copastor',
        'their_family_home',
        'their_preacher',
      ],
    });
    const membersByPastor = allMembers.filter(
      (member) => member.their_pastor?.id === dataPastor.id,
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
        updated_by: user,
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

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }
}
