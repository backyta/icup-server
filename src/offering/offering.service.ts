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

import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';
import { SearchType, TypeEntity, SearchTypeOfName } from '@/common/enums';
import { searchPeopleBy } from '@/common/helpers';

import { Offering } from '@/offering/entities';
import { CreateOfferingDto, UpdateOfferingDto } from '@/offering/dto';

import { Disciple } from '@/disciple/entities';
import { CoPastor } from '@/copastor/entities';
import { FamilyHouse } from '@/family-house/entities';
import { User } from '@/user/entities';

@Injectable()
export class OfferingService {
  private readonly logger = new Logger('OfferingsService');

  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepository: Repository<Offering>,

    @InjectRepository(Disciple)
    private readonly memberRepository: Repository<Disciple>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  //* CREATE MEMBER
  async create(
    createOfferingDto: CreateOfferingDto,
    user: User,
  ): Promise<Offering> {
    const { copastor_id, member_id, family_home_id, type, sub_type } =
      createOfferingDto;

    //TODO : hacer validación cuando pase a autenticación, solo podrá hacer un tesorero o superusuario (ofrenda y diezmo)

    if (
      type === 'tithe' &&
      !member_id &&
      (copastor_id || family_home_id || sub_type)
    ) {
      throw new BadRequestException(
        `For tithes only the member_id is required`,
      );
    }

    if (type === 'offering' && !sub_type) {
      throw new BadRequestException(
        `For any type of offerings it is required to assign a sub_type`,
      );
    }

    if (type === 'offering' && sub_type === 'zonal_fasting' && !copastor_id) {
      throw new BadRequestException(
        `To register offerings with sub_type 'zonal-fasting' the copastor_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'zonal_vigil' && !copastor_id) {
      throw new BadRequestException(
        `To register offerings with sub_type 'zonal-vigil' the copastor_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'family_home' && !family_home_id) {
      throw new BadRequestException(
        `To register offerings with sub_type 'family_home' the family_home_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'special' && !member_id) {
      throw new BadRequestException(
        `To register offerings with sub_type 'special' the member_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'church_ground' && !member_id) {
      throw new BadRequestException(
        `To register offerings with sub_type 'church_ground' the member_id is required`,
      );
    }

    let dataCopastor: CoPastor;
    let dataFamilyHome: FamilyHouse;
    let dataMember: Disciple;

    if (copastor_id) {
      dataCopastor = await this.coPastorRepository.findOneBy({
        id: copastor_id,
      });

      if (!dataCopastor) {
        throw new NotFoundException(
          `CoPastor was not found with id ${copastor_id}`,
        );
      }
    }

    if (family_home_id) {
      dataFamilyHome = await this.familyHouseRepository.findOneBy({
        id: family_home_id,
      });

      if (!dataFamilyHome) {
        throw new NotFoundException(
          `Family-Home was not found with id ${family_home_id}`,
        );
      }
    }

    if (member_id) {
      dataMember = await this.memberRepository.findOneBy({
        id: member_id,
      });

      if (!dataMember) {
        throw new NotFoundException(
          `Member was not found with id ${member_id}`,
        );
      }
    }

    try {
      const dataOffering = this.offeringRepository.create({
        ...createOfferingDto,
        family_home: dataFamilyHome,
        member: dataMember,
        copastor: dataCopastor,
        created_at: new Date(),
        created_by: user,
      });

      return await this.offeringRepository.save(dataOffering);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<Offering[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.offeringRepository.find({
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY SEARCH TERM AND TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Offering[] | Offering> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let offering: Offering | Offering[];

    //* Find UUID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      offering = await this.offeringRepository.findOne({
        where: { id: term },
      });

      if (!offering) {
        throw new NotFoundException(
          `Offering record was not found with this UUID`,
        );
      }
    }

    //* SEARCH TITHES OR OFFERINGS BY NAMES
    //! Search all by name Copastor(zonal, home), Preacher(home), Member(tithe & offe.special)

    //* Find by first-name Member --> Many
    if (term && type === SearchType.firstName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.firstName,
        limit,
        offset,
        type_entity: TypeEntity.offeringEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.offeringRepository,
      });

      return resultSearch;
    }

    //* Find last-name Member --> Many
    if (term && type === SearchType.lastName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.lastName,
        limit,
        offset,
        type_entity: TypeEntity.offeringEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.offeringRepository,
      });

      return resultSearch;
    }

    //* Find full-name Member --> One
    if (term && type === SearchType.fullName && type_of_name) {
      const resultSearch = await searchPeopleBy({
        term,
        search_type: SearchType.fullName,
        limit,
        offset,
        type_entity: TypeEntity.offeringEntity,
        type_of_name: type_of_name as SearchTypeOfName,
        search_repository: this.memberRepository,
        entity_repository: this.offeringRepository,
      });

      return resultSearch;
    }

    //* SEARCH OFFERINGS

    //! Search record of Offerings by house code

    //* Find Code (Only Offering family_home) --> Many
    if (term && type === SearchType.code) {
      const allFamilyHouses = await this.familyHouseRepository
        .createQueryBuilder('fh')
        .where('UPPER(fh.code) LIKE UPPER(:term)', {
          term: `%${term}%`,
        })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (allFamilyHouses.length === 0) {
        throw new NotFoundException(
          `No FamilyHouses were found with this code of Family Home: ${term}`,
        );
      }

      const offerings = await this.offeringRepository.find();

      const familyHousesOffering = allFamilyHouses.map((house) => {
        const newOfferings = offerings.filter(
          (offering) => offering.family_home?.code_house === house.code_house,
        );
        return newOfferings;
      });

      const arrayOfferingsFamilyHomeFlattened = familyHousesOffering.flat();

      if (arrayOfferingsFamilyHomeFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings with this code of family home ${term}`,
        );
      }

      return arrayOfferingsFamilyHomeFlattened;
    }

    //* Find Offering by copastor_id --> Many
    if (isUUID(term) && type === SearchType.copastor_id) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .where('records.copastor_id =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `No offering records found with this copastor_id: ${term} `,
        );
      }
    }

    //! MIXED QUERIES by type, sub_type, date

    //* Find by date (offering & tithe) --> Many
    if (term && type === SearchType.date) {
      const parsedDate = new Date(term).toISOString().split('T')[0];

      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .leftJoinAndSelect('records.member', 'rel2')
        .leftJoinAndSelect('records.family_home', 'rel3')
        .where('records.created_at::date =:term', { term: parsedDate })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `No records found with this date: ${term} `,
        );
      }
    }

    //* Find by type(offering or tithe) --> Many
    if (term && type === SearchType.type_offering) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .leftJoinAndSelect('records.member', 'rel2')
        .leftJoinAndSelect('records.family_home', 'rel3')
        .where('records.type =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `Not found records with these type: ${term}`,
        );
      }
    }

    //* Find by type & sub-type(offering) --> Many
    if (term && type === SearchType.offering_sub_type) {
      const parts = term.split('+');

      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .leftJoinAndSelect('records.member', 'rel2')
        .leftJoinAndSelect('records.family_home', 'rel3')
        .where('records.type =:term1', { term1: parts[0] })
        .andWhere('records.sub_type =:term2', { term2: parts[1] })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `Not found records with these type & sub_type: ${term
            .split('+')
            .join(' - ')}`,
        );
      }
    }

    //* Find by type & sub-type & date (offering) --> Many
    if (term && type === SearchType.offering_sub_type_date) {
      const parts = term.split('+');
      const parsedDate = new Date(parts[2]).toISOString().split('T')[0];

      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .leftJoinAndSelect('records.member', 'rel2')
        .leftJoinAndSelect('records.family_home', 'rel3')
        .where('records.type =:term1', { term1: parts[0] })
        .andWhere('records.sub_type =:term2', { term2: parts[1] })
        .andWhere('records.created_at::date =:term3', { term3: parsedDate })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `Not found records with these type & sub_type & date: ${term
            .split('+')
            .join(' - ')}`,
        );
      }
    }

    //* Find by type & date (thite & offering) --> Many
    if (term && type === SearchType.type_offering_date) {
      const parts = term.split('+');
      const parsedDate = new Date(parts[1]).toISOString().split('T')[0];

      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.copastor', 'rel1')
        .leftJoinAndSelect('records.member', 'rel2')
        .leftJoinAndSelect('records.family_home', 'rel3')
        .where('records.type =:term1', { term1: parts[0] })
        .andWhere('records.created_at::date =:term2', { term2: parsedDate })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new NotFoundException(
          `Not found records with these type_date: ${term
            .split('+')
            .join(' - ')}`,
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
      (SearchType.firstName || SearchType.lastName || SearchType.fullName)
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (
      type_of_name &&
      type_of_name !== SearchTypeOfName.offeringFastingCopastor &&
      type_of_name !== SearchTypeOfName.offeringMember &&
      type_of_name !== SearchTypeOfName.titheMember &&
      type_of_name !== SearchTypeOfName.offeringHouseCopastor &&
      type_of_name !== SearchTypeOfName.offeringHousePreacher
    ) {
      throw new BadRequestException(
        `For this route you can only use: ${SearchTypeOfName.offeringFastingCopastor} or ${SearchTypeOfName.offeringMember} or ${SearchTypeOfName.titheMember} or ${SearchTypeOfName.offeringHouseCopastor} or ${SearchTypeOfName.offeringHousePreacher}`,
      );
    }

    if (!offering)
      throw new NotFoundException(
        `Offerings or Tithe records with this term: ${term} not found`,
      );

    return offering;
  }

  //* UPDATE FOR ID
  async update(
    id: string,
    updateOfferingDto: UpdateOfferingDto,
    user: User,
  ): Promise<Offering> {
    const { type, sub_type, copastor_id, family_home_id, member_id, comments } =
      updateOfferingDto;

    const dataOffering = await this.offeringRepository.findOneBy({ id });

    if (!comments) {
      throw new BadRequestException(
        `Reason (comments) why this record is being modified is required`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (
      type === 'tithe' &&
      (dataOffering.copastor ||
        dataOffering.family_home ||
        dataOffering.sub_type !== 'special') &&
      sub_type
    ) {
      throw new BadRequestException(
        `You can only update an offering record to a tithe record if the sub_type is 'special', do not assign 'sub_type' to the record being updated to tithe`,
      );
    }

    if (
      dataOffering.type === 'tithe' &&
      type === 'offering' &&
      sub_type !== 'special'
    ) {
      throw new BadRequestException(
        `A record can only be updated from tithe to offering if the sub_type is 'special'`,
      );
    }

    if (type === 'offering' && !sub_type) {
      throw new BadRequestException(
        `To update any type of offerings it is required to assign a sub_type`,
      );
    }

    if (type === 'offering' && sub_type === 'zonal_fasting' && !copastor_id) {
      throw new BadRequestException(
        `To update offerings with sub_type 'zonal-fasting' the copastor_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'family_home' && !family_home_id) {
      throw new BadRequestException(
        `To update offerings with sub_type 'family_home' the family_home_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'special' && !member_id) {
      throw new BadRequestException(
        `To update offerings with sub_type 'special' the member_id is required`,
      );
    }

    if (type === 'offering' && sub_type === 'church_ground' && !member_id) {
      throw new BadRequestException(
        `To update offerings with sub_type 'church_ground' the member_id is required`,
      );
    }

    let dataCopastor: CoPastor;
    let dataFamilyHome: FamilyHouse;
    let dataMember: Disciple;

    if (copastor_id) {
      dataCopastor = await this.coPastorRepository.findOneBy({
        id: copastor_id,
      });

      if (!dataCopastor) {
        throw new NotFoundException(
          `CoPastor was not found with id ${copastor_id}`,
        );
      }

      dataFamilyHome = null;
      dataMember = null;
    }

    if (family_home_id) {
      dataFamilyHome = await this.familyHouseRepository.findOneBy({
        id: family_home_id,
      });

      if (!dataFamilyHome) {
        throw new NotFoundException(
          `Family-Home was not found with id ${family_home_id}`,
        );
      }

      dataCopastor = null;
      dataMember = null;
    }

    if (member_id) {
      dataMember = await this.memberRepository.findOneBy({
        id: member_id,
      });

      if (!dataMember) {
        throw new NotFoundException(
          `Member was not found with id ${member_id}`,
        );
      }

      dataCopastor = null;
      dataFamilyHome = null;
    }

    const updateOffering = await this.offeringRepository.preload({
      id: dataOffering.id,
      ...updateOfferingDto,
      sub_type: type === 'tithe' ? null : sub_type,
      member: dataMember,
      copastor: dataCopastor,
      family_home: dataFamilyHome,
      updated_at: new Date(),
      updated_by: user,
    });

    try {
      return await this.offeringRepository.save(updateOffering);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} offering`;
  // }

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  //! DELETE FOR SEED
  async deleteAllOfferings() {
    const query = this.offeringRepository.createQueryBuilder('offerings');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
