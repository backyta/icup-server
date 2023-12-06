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
import { Pastor } from '../pastor/entities/pastor.entity';
import { Member } from '../members/entities/member.entity';

import { CoPastor } from './entities/copastor.entity';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { updateAge, searchPerson, searchFullname } from '../common/helpers';
import { SearchType } from '../common/enums/search-types.enum';
import { Preacher } from 'src/preacher/entities/preacher.entity';

//TODO : probar endpoints con preacher service
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

    // @InjectRepository(FamilyHouses)
    // private readonly familyHousesRepository: Repository<FamilyHouses>,

    //NOTE : en un futuro se puede agregar supervisores al pastor y copastor y toda la jerarquia que tenga
  ) {}

  //* CREATE COPASTOR
  async create(createCoPastorDto: CreateCoPastorDto) {
    const { id_member, their_pastor } = createCoPastorDto;

    if (!their_pastor) {
      throw new BadRequestException(`Propety their_pastor not should empty`);
    }

    const member = await this.memberRepository.findOneBy({
      id: id_member,
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Pastor"`,
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
      throw new NotFoundException(`Not faound Pastor with id ${id_member}`);
    }

    if (!pastor.is_active) {
      throw new BadRequestException(
        `The property is_active in pastor must be a true value"`,
      );
    }

    if (member.their_pastor) {
      try {
        const coPastorInstance = this.coPastorRepository.create({
          member: member,
          their_pastor: member.their_pastor,
          created_at: new Date(),
          created_by: 'Kevin',
        });

        return await this.coPastorRepository.save(coPastorInstance);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      //! Si no viene seteo lo del DTO en mi member y en mi copastor
      const dataMember = await this.memberRepository.preload({
        id: member.id,
        their_pastor: pastor,
      });

      try {
        const preacherInstance = this.preacherRepository.create({
          member: member,
          their_pastor: pastor,
          created_at: new Date(),
          created_by: 'Kevin',
        });

        await this.memberRepository.save(dataMember);
        return await this.preacherRepository.save(preacherInstance);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.coPastorRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let coPastor: CoPastor | CoPastor[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      coPastor = await this.coPastorRepository.findOneBy({ id: term });

      if (!coPastor) {
        throw new BadRequestException(`No se encontro Copastor con este UUID`);
      }

      if (!coPastor.is_active) {
        throw new BadRequestException(`CoPastor should is active`);
      }

      //TODO : hacer familyHouses igual que preachers
      //* Conteo y asignacion de Casas
      // const allFamilyHouses = await this.familyHousesRepository.find();
      // const listCopastores = allFamilyHouses.filter(
      //   (home) => home.their_pastor.id === term,
      // );

      // const newListCopastoresID = listCopastores.map(
      //   (copastores) => copastores.id,
      // );

      //* Conteo y asignacion de Preachers
      const allPreachers = await this.preacherRepository.find();
      const listPreachers = allPreachers.filter(
        (preacher) => preacher.their_pastor.id === term,
      );

      const newListPreachersID = listPreachers.map(
        (copastores) => copastores.id,
      );

      coPastor.count_preachers = listPreachers.length;
      coPastor.preachers = newListPreachersID;

      coPastor.member.age = updateAge(coPastor.member);

      await this.coPastorRepository.save(coPastor);
    }

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
        });

        if (coPastores.length === 0) {
          throw new NotFoundException(
            `Not found coPastores with these names: ${term}`,
          );
        }
        return coPastores;
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

    if (!coPastor)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return coPastor;
  }

  //* UPDATE FOR ID
  async update(id: string, updateCoPastorDto: UpdateCoPastorDto) {
    const { roles, their_pastor, id_member } = updateCoPastorDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (!roles.includes('copastor')) {
      throw new BadRequestException(`Roles should includes ['copastor']`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });
    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor not found with id: ${id}`);
    }

    let member: Member;
    if (!id_member) {
      member = await this.memberRepository.findOneBy({
        id: dataCoPastor.member.id,
      });
    } else {
      member = await this.memberRepository.findOneBy({
        id: id_member,
      });
    }

    if (!member) {
      throw new NotFoundException(`Member Not found with id ${id_member}`);
    }

    if (!member.roles.includes('copastor')) {
      throw new BadRequestException(
        `No se puede asignar este miembro como Copastor, falta rol: ['copastor']`,
      );
    }

    let pastor: Pastor;
    if (!their_pastor) {
      pastor = await this.pastorRepository.findOneBy({
        id: dataCoPastor.their_pastor.id,
      });
    } else {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
    }

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    // TODO
    //* Conteo y asignacion de Casas
    // const allFamilyHouses = await this.familyHousesRepository.find();
    // const listCopastores = allFamilyHouses.filter(
    //   (home) => home.their_pastor.id === term,
    // );

    // const newListCopastoresID = listCopastores.map(
    //   (copastores) => copastores.id,
    // );

    //* Conteo y asignacion de Preachers
    const allPreachers = await this.preacherRepository.find();
    const listPreachers = allPreachers.filter(
      (preacher) => preacher.their_pastor.id === id,
    );

    const listPreachersID = listPreachers.map((copastores) => copastores.id);

    //* Asignacion de pastor a member y a copastor (igual referencia, se cambia en ambas tablas)
    const dataMember = await this.memberRepository.preload({
      id: member.id,
      ...updateCoPastorDto,
      updated_at: new Date(),
      their_pastor: pastor,
      //? Colocar usuario cuando se haga auth
      updated_by: 'Kevinxd',
    });

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      member: dataMember,
      their_pastor: pastor,
      // houses:,
      count_houses: 16,
      preachers: listPreachersID,
      count_preachers: listPreachers.length,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.coPastorRepository.save(coPastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return coPastor;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataCoPastor = await this.coPastorRepository.findOneBy({ id });

    if (!dataCoPastor) {
      throw new NotFoundException(`CoPastor with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataCoPastor.member.id,
      is_active: false,
    });

    const coPastor = await this.coPastorRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await this.memberRepository.save(member);
      await this.coPastorRepository.save(coPastor);
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

  private searchCoPastorBy = async (
    term: string,
    searchType: SearchType,
    limit: number,
    offset: number,
    repository: Repository<Member>,
  ) => {
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
        throw new NotFoundException(`Not found member with roles 'copastor'`);
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
          `Not found coPastor with these names ${term.slice(0, -1)}`,
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
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
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
          `Not found coPastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayCoPastorMembersFlattened;
    }
  };
}
