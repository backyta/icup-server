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
    const { copastor_id, member_id, family_home_id, type } = createOfferingDto;

    //TODO : hacer validacion cuando pase a autenticacion, solo podra hacer un tesosrero o superusuario
    //! Ver si se hace la valdacion sola con el type y subtype(DTO)

    if (type === 'tithe' && (copastor_id || family_home_id)) {
      throw new BadRequestException(
        `Para diezmos solo se requiere el member_id`,
      );
    }

    if (type === 'offering' && member_id) {
      throw new BadRequestException(
        `Para cualquier tipo de ofrendas no se requiere el member_id`,
      );
    }

    const dataCopastor = await this.coPastorRepository.findOneBy({
      id: copastor_id,
    });

    if (!dataCopastor) {
      throw new BadRequestException(
        `Coastor was not found with id ${copastor_id}`,
      );
    }

    const dataFamilyHome = await this.familyHomeRepository.findOneBy({
      id: family_home_id,
    });

    if (!dataFamilyHome) {
      throw new BadRequestException(
        `Family-Home was not found with id ${family_home_id}`,
      );
    }

    const dataMember = await this.memberRepository.findOneBy({
      id: member_id,
    });

    if (!dataMember) {
      throw new BadRequestException(
        `Member was not found with id ${member_id}`,
      );
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
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let offering: Offering | Offering[];

    //* Find UUID --> One
    if (isUUID(term) && type === SearchType.id) {
      offering = await this.offeringRepository.findOne({
        where: { id: term },
        //* Colocara a by si se cargan las relaciones
      });

      if (!offering) {
        throw new BadRequestException(
          `Offering record was not found with this UUID`,
        );
      }
    }

    //! Independiente quiero solo consultar la pertenencia, por copastor, por miembro, por casa.
    //* Find Offering by copastor_id --> Many
    if (isUUID(term) && type === SearchType.copastor_id) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
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

    //* Find Offering by family_home_id --> Many
    if (isUUID(term) && type === SearchType.family_home_id) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.family_home_id =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `No offering records found with this family_home_id: ${term} `,
        );
      }
    }

    //* Find Tithe by member_id --> Many
    if (isUUID(term) && type === SearchType.member_id) {
      offering = await this.offeringRepository
        .createQueryBuilder('records')
        .where('records.member_id =:term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (offering.length === 0) {
        throw new BadRequestException(
          `No thite records found with this member_id: ${term} `,
        );
      }
    }

    //* Desde el front debo hacer un panel que diga eliga que desea buscar, por por tipo y fecha
    //* por ofrendas zonales(ayuno-copastor), ofrendas dominicales(fecha), diezmos, y hacer una vista.
    //* por tipo y subtipo, con fecha o sin fecha, si la coloca o no, etc (hacer todos esos casos.)

    //TODO : tomorrow seguir con esto (los de verde y ver mas casos)
    //? Importante: colocar fecha en el cuadro master(vista frontendt)

    //! Hacer typo de ofrenda y diezmo y mandar al seachType
    //* Se quiero buscar todos los diezmos (sin fecha) - todos
    //* Se quiero buscar todos las ofrendeas (sin fecha ni sub tipo)

    //* Derrepente quiero buscar diezmo de la fecha tal...
    //* Derrepente quiero buscar Ofrenda con subtipo tal..., y en fecha tal...
    //* Derrepente quiero buscar Ofrenda con subtipo (sin fecha)
    //! Para buscar un subtipo debo mandar el tipo. (y colocarlo en el query)
    //! Podriamos cortar toda el termino por un - y setear a cada columna, y mandar un tipo especial,
    //! dependiendo cuantos termino mandemos

    //* Find by type --> Many
    // if (term && type === SearchType.type) {
    //   offering = await this.offeringRepository
    //     .createQueryBuilder('records')
    //     .where('records.type =:term', { term })
    //     .skip(offset)
    //     .limit(limit)
    //     .getMany();

    //   if (offering.length === 0) {
    //     throw new BadRequestException(
    //       `Not found records with these type: ${term}`,
    //     );
    //   }
    // }

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
      throw new NotFoundException(`Offering record with ${term} not found`);

    return offering;
  }

  update(id: number, updateOfferingDto: UpdateOfferingDto) {
    return `This action updates a #${id} offering`;
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
}
