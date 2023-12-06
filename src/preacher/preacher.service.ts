import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { Repository } from 'typeorm';
import { Preacher } from './entities/preacher.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from 'src/common/enums/search-types.enum';
import { searchFullname, searchPerson, updateAge } from 'src/common/helpers';

//TODO : finalizando recien pasar a Entidad familyHouses
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

    // @InjectRepository(FamilyHouses)
    // private readonly familyHousesRepository: Repository<FamilyHouses>,
  ) {}

  //* CREATE PREACHER
  async create(createPreacherDto: CreatePreacherDto) {
    const { id_member, their_pastor, their_copastor } = createPreacherDto;

    //* Validation member
    const member = await this.memberRepository.findOne({
      where: { id: id_member },
      relations: ['their_copastor', 'their_pastor'],
    });

    if (!member) {
      throw new NotFoundException(`Not faound Member with id ${id_member}`);
    }

    if (!member.roles.includes('preacher')) {
      throw new BadRequestException(
        `El id_member debe tener el rol de "Preacher"`,
      );
    }

    if (!member.is_active) {
      throw new BadRequestException(
        `The property is_active in member must be a true value"`,
      );
    }

    //* Validation pastor
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

    //* Validation copastor
    const copastor = await this.coPastorRepository.findOneBy({
      id: their_copastor,
    });

    if (!copastor) {
      throw new NotFoundException(`Not faound CoPastor with id ${id_member}`);
    }

    if (!copastor.is_active) {
      throw new BadRequestException(
        `The property is_active in CoPastor must be a true value"`,
      );
    }

    //* Si existe info en el member lo seteo, si no uso el del DTO
    if (member.their_copastor && member.their_pastor) {
      try {
        const preacherInstance = this.preacherRepository.create({
          member: member,
          their_pastor: member.their_pastor,
          their_copastor: member.their_copastor,
          created_at: new Date(),
          created_by: 'Kevin',
        });

        return await this.preacherRepository.save(preacherInstance);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    } else {
      //! Si no tiene seteo lo que viene en el DTO en mi member y tmb en mi pracher
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
          created_by: 'Kevin',
        });

        await this.memberRepository.save(dataMember);
        return await this.preacherRepository.save(preacherInstance);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.preacherRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let preacher: Preacher | Preacher[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      preacher = await this.preacherRepository.findOneBy({ id: term });

      if (!preacher) {
        throw new BadRequestException(`No se encontro Preacher con este UUID`);
      }

      if (!preacher.is_active) {
        throw new BadRequestException(`Pracher should is active`);
      }

      // TODO
      //* Conteo de Cantidad de miembros
      // const allFamilyHouses = await this.familyHousesRepository.find();
      // const listCopastores = allFamilyHouses.filter(
      //   (home) => home.their_pastor.id === term,
      // );

      // const newListCopastoresID = listCopastores.map(
      //   (copastores) => copastores.id,
      // );

      //* Asignacion de Casa familiar al buscar por ID

      // pastor.member.age = updateAge(pastor.member);
      // pastor.count_copastor = listCopastores.length;
      // pastor.copastores = newListCopastoresID;

      preacher.member.age = updateAge(preacher.member);
      await this.preacherRepository.save(preacher);
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      const resultSearch = await this.searchPreacherBy(
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
      const resultSearch = await this.searchPreacherBy(
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
      const resultSearch = await this.searchPreacherBy(
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

        const preachers = await this.preacherRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
        });

        if (preachers.length === 0) {
          throw new NotFoundException(
            `Not found Preachers with these names: ${term}`,
          );
        }
        return preachers;
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

    if (!preacher)
      throw new NotFoundException(`CoPastor with ${term} not found`);

    return preacher;
  }

  //* UPDATE PREACHER
  async update(id: string, updatePreacherDto: UpdatePreacherDto) {
    const { roles, their_copastor, their_pastor } = updatePreacherDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher not found with id: ${id}`);
    }

    if (!dataPreacher.member.id)
      throw new NotFoundException(
        `Member with id: ${dataPreacher.member.id} not found`,
      );

    if (!dataPreacher.member.roles.includes('preacher')) {
      throw new BadRequestException(
        `This member cannot be assigned as Preacher, his role must contain: ["preacher"]`,
      );
    }

    let pastor: Pastor;
    if (!their_pastor) {
      pastor = await this.pastorRepository.findOneBy({
        id: dataPreacher.their_pastor.id,
      });
    } else {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
    }

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    let copastor: CoPastor;
    if (!their_copastor) {
      copastor = await this.coPastorRepository.findOneBy({
        id: dataPreacher.their_copastor.id,
      });
    } else {
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
    }

    if (!copastor) {
      throw new NotFoundException(
        `CoPastor Not found with id ${their_copastor}`,
      );
    }

    if (
      !roles.includes('preacher') ||
      roles.includes('pastor') ||
      roles.includes('copastor')
    ) {
      throw new BadRequestException(
        `Solo se permite admite rol de Preacher o Member`,
      );
    }

    const member = await this.memberRepository.preload({
      ...updatePreacherDto,
      id: dataPreacher.member.id,
      updated_at: new Date(),
      their_pastor: pastor,
      their_copastor: copastor,
      //? Colocar usuario cuando se haga auth.
      updated_by: 'Kevinxd',
    });

    //TODO : hacer las mismas consultas para sacar el conteo y array, al actualiza se setea al igual que buscar por ID.
    const preacher = await this.preacherRepository.preload({
      id: id,
      member: member,
      their_pastor: pastor,
      their_copastor: copastor,
      count_members: 15,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.preacherRepository.save(preacher);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return preacher;
  }

  //* DELETE FOR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataPreacher = await this.preacherRepository.findOneBy({ id });

    if (!dataPreacher) {
      throw new NotFoundException(`Preacher with id: ${id} not exits`);
    }

    const member = await this.memberRepository.preload({
      id: dataPreacher.member.id,
      is_active: false,
    });

    const preacher = await this.preacherRepository.preload({
      id: id,
      is_active: false,
    });

    try {
      await this.memberRepository.save(member);
      await this.preacherRepository.save(preacher);
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

  private searchPreacherBy = async (
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

      const preacherMembers = members.filter((member) =>
        member.roles.includes('copastor'),
      );

      if (preacherMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'copastor'`);
      }

      const preachers = await this.coPastorRepository.find();

      const newPreacherMembers = preacherMembers.map((member) => {
        const newPreachers = preachers.filter(
          (preacher) =>
            preacher.member.id === member.id && preacher.is_active === true,
        );
        return newPreachers;
      });

      const ArrayPreacherMembersFlattened = newPreacherMembers.flat();

      if (ArrayPreacherMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these names ${term.slice(0, -1)}`,
        );
      }

      return ArrayPreacherMembersFlattened;
    }

    //* Para find by full_name
    if (searchType === 'full_name') {
      const members = await searchFullname({
        term,
        limit,
        offset,
        repository,
      });

      const preacherMembers = members.filter((member) =>
        member.roles.includes('preacher'),
      );

      if (preacherMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Preacher'`);
      }

      const preachers = await this.preacherRepository.find();

      const newPreacherMembers = preacherMembers.map((member) => {
        const newPreacher = preachers.filter(
          (preacher) =>
            preacher.member.id === member.id && preacher.is_active === true,
        );
        return newPreacher;
      });

      const ArrayPreacherMembersFlattened = newPreacherMembers.flat();

      if (ArrayPreacherMembersFlattened.length === 0) {
        throw new NotFoundException(
          `Not found Preachers with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return ArrayPreacherMembersFlattened;
    }
  };
}
