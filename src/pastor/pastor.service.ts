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

import { SearchType } from '../common/enums/search-types.enum';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { searchPerson, updateAge, searchFullname } from '../common/helpers';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Preacher } from 'src/preacher/entities/preacher.entity';

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    //TODO : asignar casas al pastor tmb
  ) {}

  //* CREATE PASTOR
  async create(createPastorDto: CreatePastorDto): Promise<Pastor> {
    const { id_member } = createPastorDto;

    const member = await this.memberRepository.findOneBy({
      id: id_member,
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('pastor')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Pastor"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    try {
      const pastorInstance = this.pastorRepository.create({
        member: member,
        created_at: new Date(),
        //NOTE : cambiar por id de usuario
        created_by: 'Kevin',
      });

      return await this.pastorRepository.save(pastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED)
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pastorRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
    });
  }

  //* FIND POR TERMINO Y TIPO DE BUSQUEDA (FILTRO)
  //! Ya que esto es demasiado codigo y creacera se puede hacer un endpoint con solo el id @Param y agreagrle pagination DTO
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let pastor: Pastor | Pastor[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      pastor = await this.pastorRepository.findOne({
        where: { id: term },
      });

      if (!pastor) {
        throw new BadRequestException(`No se encontro Pastor con este UUID`);
      }

      if (!pastor.is_active) {
        throw new BadRequestException(`Pastor should is active`);
      }

      //* Conteo y asignacion de copastores
      const allCopastores = await this.coPastorRepository.find();
      const listCopastores = allCopastores.filter(
        (copastor) => copastor.their_pastor.id === term,
      );

      const listCopastoresID = listCopastores.map(
        (copastores) => copastores.id,
      );

      //* Conteo y asignacion de preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.their_pastor.id === term,
      );

      const listPreachersID = listPreachers.map((copastores) => copastores.id);

      pastor.count_copastores = listCopastores.length;
      pastor.copastores = listCopastoresID;

      pastor.preachers = listPreachersID;
      pastor.count_preachers = listPreachers.length;

      pastor.member.age = updateAge(pastor.member);

      await this.pastorRepository.save(pastor);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchPastorBy(
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
      const resultSearch = await this.searchPastorBy(
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
      const resultSearch = await this.searchPastorBy(
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

        const pastores = await this.pastorRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
        });

        if (pastores.length === 0) {
          throw new NotFoundException(
            `Not found Pastores with these names: ${term}`,
          );
        }
        return pastores;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
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

    if (!pastor) throw new NotFoundException(`Pastor with ${term} not found`);

    return pastor;
  }

  //* UPDATE FOR ID
  async update(id: string, updatePastorDto: UpdatePastorDto) {
    const { roles } = updatePastorDto;

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor not found with id: ${id}`);
    }

    if (!roles.includes('pastor')) {
      throw new BadRequestException(`Roles should includes require ['pastor']`);
    }

    //* Conteo de copastores
    const allCopastores = await this.coPastorRepository.find();
    const listCopastores = allCopastores.filter(
      (copastor) => copastor.their_pastor.id === id,
    );

    const listCopastoresID = listCopastores.map((copastores) => copastores.id);

    //* Conteo y asignacion de preachers
    const allPreachers = await this.preacherRepository.find();
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_pastor.id === id,
    );

    const listPreachersID = listPreachers.map((copastores) => copastores.id);

    const member = await this.memberRepository.preload({
      ...updatePastorDto,
      id: dataPastor.member.id,
      updated_at: new Date(),
      // NOTE: cambiar por uuid en relacion con User
      updated_by: 'Kevinxd',
    });

    const pastor = await this.pastorRepository.preload({
      id: id,
      member: member,
      count_copastores: listCopastores.length,
      copastores: listCopastoresID,
      count_preachers: listPreachers.length,
      preachers: listPreachersID,
      updated_at: new Date(),
      //NOTE : cambiar por id de usuario
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.pastorRepository.save(dataPastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return pastor;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataPastor.member.id,
      is_active: false,
    });

    const pastor = await this.pastorRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await Promise.all([
        this.memberRepository.save(member),
        this.pastorRepository.save(pastor),
      ]);
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

  private searchPastorBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    repository: Repository<Member>,
  ): Promise<Pastor | Pastor[]> => {
    //* Para find by first or last name
    if (searchType === 'first_name' || searchType === 'last_name') {
      const members = await searchPerson({
        term,
        searchType,
        limit,
        offset,
        repository,
      });

      const pastorMembers = members.filter((member) =>
        member.roles.includes('pastor'),
      );

      if (pastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const pastores = await this.pastorRepository.find();

      const newPastorMembers = pastorMembers.map((member) => {
        const newPastores = pastores.filter(
          (pastor) =>
            pastor.member.id === member.id && pastor.is_active === true,
        );
        return newPastores;
      });

      const ArrayPastorMembersFlattened = newPastorMembers.flat();

      if (ArrayPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayPastorMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const pastorMembers = members.filter((member) =>
        member.roles.includes('pastor'),
      );

      if (pastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const pastores = await this.pastorRepository.find();

      const newPastorMembers = pastorMembers.map((member) => {
        const newPastores = pastores.filter(
          (pastor) =>
            pastor.member.id === member.id && pastor.is_active === true,
        );
        return newPastores;
      });

      const ArrayPastorMembersFlattened = newPastorMembers.flat();

      if (ArrayPastorMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPastorMembersFlattened;
    }
  };
}
