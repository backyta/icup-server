import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { UpdateOfferingDto } from './dto/update-offering.dto';
import { Offering } from './entities/offering.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { FamilyHome } from 'src/family-home/entities/family-home.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from 'src/common/enums/search-types.enum';
import { searchFullname, searchPerson } from 'src/common/helpers';

@Injectable()
export class OfferingService {
  private readonly logger = new Logger('OfferingService');

  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepository: Repository<Offering>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(FamilyHome)
    private readonly familyHomeRepository: Repository<FamilyHome>,
  ) {}

  //* CREATE MEMBER
  async create(createOfferingDto: CreateOfferingDto): Promise<Offering> {
    const { copastor_id, member_id, family_home_id, type, sub_type } =
      createOfferingDto;

    //TODO : hacer validacion cuando pase a autenticacion, solo podra hacer un tesosrero o superusuario

    if (type === 'tithe' && (copastor_id || family_home_id || sub_type)) {
      throw new BadRequestException(
        `Para diezmos solo se requiere el member_id`,
      );
    }

    if (type === 'offering' && (member_id || !sub_type)) {
      throw new BadRequestException(
        `Para cualquier tipo de ofrendas se requiere asignar un sub_type y no se requiere el member_id`,
      );
    }

    if (type === 'offering' && sub_type === 'zonal_fasting' && !copastor_id) {
      throw new BadRequestException(
        `Para registrar ofrendas con sub_type 'zonal-fasting' se requiere el copastor_id`,
      );
    }

    if (type === 'offering' && sub_type === 'family_home' && !family_home_id) {
      throw new BadRequestException(
        `Para registrar ofrendas con sub_type 'family_home' se requiere el family_home_id`,
      );
    }

    let dataCopastor: CoPastor;
    let dataFamilyHome: FamilyHome;
    let dataMember: Member;

    if (copastor_id) {
      dataCopastor = await this.coPastorRepository.findOneBy({
        id: copastor_id,
      });

      if (!dataCopastor) {
        throw new BadRequestException(
          `Coastor was not found with id ${copastor_id}`,
        );
      }
    }

    if (family_home_id) {
      dataFamilyHome = await this.familyHomeRepository.findOneBy({
        id: family_home_id,
      });

      if (!dataFamilyHome) {
        throw new BadRequestException(
          `Family-Home was not found with id ${family_home_id}`,
        );
      }
    }

    if (member_id) {
      dataMember = await this.memberRepository.findOneBy({
        id: member_id,
      });

      if (!dataMember) {
        throw new BadRequestException(
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
        created_by: 'Kevin',
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
      query_type,
    } = searchTypeAndPaginationDto;
    let offering: Offering | Offering[];

    //* Find UUID --> One
    if (isUUID(term) && type === SearchType.id) {
      offering = await this.offeringRepository.findOne({
        where: { id: term },
      });

      if (!offering) {
        throw new BadRequestException(
          `Offering record was not found with this UUID`,
        );
      }
    }

    //! BUSCAR DIEZMOS

    //? Buscar registro de Diezmo por nombres de miembro.

    //* Find by first-name Member --> Many
    if (term && type === SearchType.firstName && query_type === 'member') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find last-name Member --> Many
    if (term && type === SearchType.lastName && query_type === 'member') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find full-name Member --> One
    if (term && type === SearchType.fullName && query_type === 'member') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //! BUSCAR OFRENDAS

    //! Buscar Ofrendas por casa Familiar

    //? Buscar registro de Ofrendas por nombres de predicador

    //* Find by first-name Preacher --> Many
    if (term && type === SearchType.firstName && query_type === 'preacher') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.firstName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find by last-name Preacher --> Many
    if (term && type === SearchType.lastName && query_type === 'preacher') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.lastName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //* Find by full-name Preacher --> Many
    if (term && type === SearchType.fullName && query_type === 'preacher') {
      const resultSearch = await this.searchOfferingBy(
        term,
        SearchType.fullName,
        limit,
        offset,
        query_type,
        this.memberRepository,
      );

      return resultSearch;
    }

    //? Buscar registro de Ofrendas por codigo de casa

    //* Find Code (Only Offering family_home) --> Many
    if (term && type === SearchType.code) {
      const allFamilyHouses = await this.familyHomeRepository
        .createQueryBuilder('fh')
        .where('UPPER(fh.code) LIKE UPPER(:term)', {
          term: `%${term}%`,
        })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (allFamilyHouses.length === 0) {
        throw new BadRequestException(
          `No FamilyHouses were found with this code of Family Home: ${term}`,
        );
      }

      const offerings = await this.offeringRepository.find();

      const familyHusesOffering = allFamilyHouses.map((house) => {
        const newOfferings = offerings.filter(
          (offering) => offering.family_home?.code === house.code,
        );
        return newOfferings;
      });

      const arrayOfferingsFamilyHomeFlattened = familyHusesOffering.flat();

      if (arrayOfferingsFamilyHomeFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings with this code of family home ${term}`,
        );
      }

      return arrayOfferingsFamilyHomeFlattened;
    }

    //? Buscar Ofrendas por Ayuno Zonal (copastor)

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
        throw new BadRequestException(
          `No offering records found with this copastor_id: ${term} `,
        );
      }
    }

    //! Consultas Mezcladas por tipo, sub_type, date (mixins)

    //* Find by date (offering & tithe) --> Many
    if (term && type === SearchType.date) {
      const parsedDate = new Date(term).toISOString().split('T')[0];

      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.created_at::date =:term', { term: parsedDate })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `No records found with this date: ${term} `,
        );
      }
    }

    //TODO : continuar revisando aqui tomorrow lunes...
    //* Find by type(offering or thite) --> Many
    if (term && type === SearchType.type) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.type =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `Not found records with these type: ${term}`,
        );
      }
    }

    //* Find by type & sub-type(offering) --> Many
    if (term && type === SearchType.offering_sub_type) {
      const parts = term.split('+');

      const offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.type =:term', { term: parts[0] })
        .andWhere('records.sub_type =:term', { term: parts[1] })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `Not found records with these offering_sub_type: ${term}`,
        );
      }
    }

    //* Find by type & sub-type & date (offering) --> Many
    //! Revisar el date
    if (term && type === SearchType.offering_sub_type_date) {
      const parts = term.split('+');

      const offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.type =:term', { term: parts[0] })
        .andWhere('records.sub_type =:term', { term: parts[1] })
        .andWhere('records.date =:term', { term: parts[2] })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `Not found records with these offering_sub_type_date: ${term}`,
        );
      }
    }

    //* Find by type & date (thite & offering) --> Many
    //! Revisar el date
    if (term && type === SearchType.type_date) {
      const parts = term.split('+');

      const offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.type =:term', { term: parts[0] })
        .andWhere('records.date =:term', { term: parts[1] })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `Not found records with these type_date: ${term}`,
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

    if (!offering)
      throw new NotFoundException(
        `Offerings or Tithe records with this term: ${term} not found`,
      );

    return offering;
  }

  //TODO : hacer obligatorio el comnetario o motivo del porqu eesta actualizando
  async update(
    id: string,
    updateOfferingDto: UpdateOfferingDto,
  ): Promise<Offering> {
    const { comments } = updateOfferingDto;

    if (!comments) {
      throw new BadRequestException(
        `Se requiere motivo por el cual se esta modificando este registro`,
      );
    }

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataOffering = await this.offeringRepository.findOneBy({ id });

    const updateOffering = await this.offeringRepository.preload({
      id: dataOffering.id,
      ...updateOfferingDto,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      return await this.offeringRepository.save(updateOffering);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? Se tendria que eliminar o solo actualizar?
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

  private searchOfferingBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    query_type: string,
    repository: Repository<Member>,
  ): Promise<Offering | Offering[]> => {
    //* Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const offerings = await this.offeringRepository.find();

      let offeringsMember: Offering[][];
      if (query_type === 'member') {
        offeringsMember = members.map((member) => {
          const newOfferings = offerings.filter(
            (offering) => offering.member?.id === member.id,
          );
          return newOfferings;
        });
      }

      if (query_type === 'preacher') {
        offeringsMember = members.map((member) => {
          const newOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_preacher.member.id === member.id,
          );
          return newOfferings;
        });
      }

      const ArrayOfferingsMemberFlattened = offeringsMember.flat();

      if (ArrayOfferingsMemberFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these names: ${term.slice(
            0,
            -1,
          )}`,
        );
      }

      return ArrayOfferingsMemberFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const offerings = await this.offeringRepository.find();

      let offeringsMember: Offering[][];
      if (query_type === 'member') {
        offeringsMember = members.map((member) => {
          const newOfferings = offerings.filter(
            (offering) => offering.member?.id === member.id,
          );
          return newOfferings;
        });
      }

      if (query_type === 'preacher') {
        offeringsMember = members.map((member) => {
          const newOfferings = offerings.filter(
            (offering) =>
              offering.family_home?.their_preacher.member.id === member.id,
          );
          return newOfferings;
        });
      }

      const ArrayOfferingsMemberFlattened = offeringsMember.flat();

      if (ArrayOfferingsMemberFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Offerings or Tithes with these first_name & last_name: ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayOfferingsMemberFlattened;
    }
  };
}
