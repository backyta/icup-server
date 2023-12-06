import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFamilyHomeDto } from './dto/create-family-home.dto';
import { UpdateFamilyHomeDto } from './dto/update-family-home.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import { Member } from 'src/members/entities/member.entity';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { FamilyHome } from './entities/family-home.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from 'src/common/enums/search-types.enum';

@Injectable()
export class FamilyHomeService {
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
    private readonly familyHousesRepository: Repository<FamilyHome>,
  ) {}

  //* CREATE FAMILY HOME
  async create(createFamilyHomeDto: CreateFamilyHomeDto) {
    const { their_preacher, their_pastor, their_copastor } =
      createFamilyHomeDto;

    //* Validation pastor
    const pastor = await this.pastorRepository.findOneBy({
      id: their_pastor,
    });

    if (!pastor) {
      throw new NotFoundException(`Not faound Pastor with id ${their_pastor}`);
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in Pastor must be a true value"`,
      );
    }

    //* Validation copastor
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

    //* Validation Preacher
    const preacher = await this.preacherRepository.findOneBy({
      id: their_preacher,
    });

    if (!preacher) {
      throw new NotFoundException(
        `Not faound CoPastor with id ${their_preacher}`,
      );
    }

    if (!preacher.is_active) {
      throw new BadRequestException(
        `The property is_active in Preacher must be a true value"`,
      );
    }

    //* Create instance
    try {
      const preacherInstance = this.familyHousesRepository.create({
        ...createFamilyHomeDto,
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.familyHousesRepository.save(preacherInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.familyHousesRepository.find({
      take: limit,
      skip: offset,
    });
    //! Revisar si se cargan las relaciones o afecta, para cargarlas aqui
  }

  //* Buscar por nombbre, codigo, direccion, id predicador, id cppastor
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let familyHome: FamilyHome | FamilyHome[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      //TODO : setear la cantidad de miembros con la tabla members y mismo id
      //! Despues de asignar una casa al miembro en la tabla miembro, aqui en buscar casa por id
      //! actualizamos la cantidad y metemos en un array todos los que correspondan por id de casa.

      familyHome = await this.familyHousesRepository.findOneBy({ id: term });

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro FamilyHome con este UUID`,
        );
      }
    }

    //* Find Code --> One
    if (term && type === SearchType.code) {
      familyHome = await this.familyHousesRepository.findOneBy({ code: term });

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro FamilyHome con este code ${term}`,
        );
      }
    }

    //* Find Address --> One
    if (term && type === SearchType.address) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.address LIKE :term', { term: `%${term}%` })
        .getOne();

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro una FamilyHome con este address : ${term} `,
        );
      }
    }

    //* Find Preacher --> One
    if (isUUID(term) && type === SearchType.their_preacher) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.their_preacher = :term', { term })
        .getOne();

      if (!familyHome) {
        throw new BadRequestException(
          `No se encontro una FamilyHome con este their_preacher : ${term} `,
        );
      }
    }

    //* Find CoPastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      familyHome = await this.familyHousesRepository
        .createQueryBuilder('fh')
        .where('fh.their_copastor = :term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (familyHome.length === 0) {
        throw new BadRequestException(
          `No se encontro ninguna FamilyHome con este their_copastor : ${term} `,
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

    return familyHome;
  }

  update(id: string, updateFamilyHomeDto: UpdateFamilyHomeDto) {
    return `This action updates a #${id} familyHome`;
  }

  remove(id: number) {
    return `This action removes a #${id} familyHome`;
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
}
