import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Repository } from 'typeorm';
import { Pastor } from './entities/pastor.entity';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { isUUID } from 'class-validator';
import { SearchType } from '../common/enums/search-types.enum';
import { searchPerson } from 'src/common/helpers/search-person.helper';
import { updateAge } from 'src/common/helpers/update-age.helper';
import { searchFullname } from 'src/common/helpers/search-fullname.helper';
// import { UpdateMemberDto } from '../members/dto/update-member.dto';

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,
  ) {}

  //* CREATE PASTOR
  async create(createPastorDto: CreatePastorDto): Promise<Pastor> {
    const { idMember } = createPastorDto;

    const member: Member = await this.memberRepository.findOneBy({
      id: idMember,
    });

    if (!member)
      throw new NotFoundException(`Member with id: ${idMember} not found`);

    if (!member.roles.includes('pastor')) {
      throw new BadRequestException(
        `This member cannot be assigned as Pastor, his role must contain: ["pastor"]`,
      );
    }

    try {
      const pastorInstance = this.pastorRepository.create({
        member: member,
        //TODO : sacar conteo por id (table copastor), copastorService.queryBuilder hacer conteo aqui y que revise constantement
        // O hacer un query builder aca consultando la otra entidad y en esta columa pongo el conteo por id de pastor
        count_copastor: 5,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.pastorRepository.save(pastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pastorRepository.find({
      take: limit,
      skip: offset,
    });
  }

  //* FIND POR TERMINO Y TIPO DE BUSQUEDA (FILTRO)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let pastor: Pastor | Pastor[];

    //* Find ID --> One
    if (isUUID(term) && type === SearchType.id) {
      pastor = await this.pastorRepository.findOneBy({ id: term });
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

    //! General Exceptions
    if (!isUUID(term) && type === SearchType.id) {
      throw new BadRequestException(`Not valid UUID`);
    }

    if (term && !Object.values(SearchType).includes(type as SearchType)) {
      throw new BadRequestException(
        `Type not valid, should be: ${Object.values(SearchType).join(', ')}`,
      );
    }

    if (!pastor) throw new NotFoundException(`Member with ${term} not found`);

    return pastor;
  }

  //* UPDATE FOR ID
  async update(id: string, updatePastorDto: UpdatePastorDto) {
    //? No se podra cambiar el ID de pastor solo su info (incluida miembro)
    const dataPastor = await this.pastorRepository.findOneBy({ id });

    if (!dataPastor) {
      throw new NotFoundException(`Pastor not found with id: ${dataPastor.id}`);
    }

    const member = await this.memberRepository.preload({
      id: dataPastor.member.id,
      updated_at: new Date(),
      //? Colocar usuario cuando se haga auth
      updated_by: 'Kevinxd',
      ...updatePastorDto,
    });

    if (!member)
      throw new NotFoundException(`Member with id: ${member.id} not found`);

    if (!member.roles.includes('pastor')) {
      throw new BadRequestException(
        `This member cannot be assigned as Pastor, his role must contain: ["pastor"]`,
      );
    }

    const pastor = await this.pastorRepository.preload({
      id: id,
      member: member,
      //TODO : Contar con query con tabla copastor
      count_copastor: 16,
      updated_at: new Date(),
      updated_by: 'Kevinxd',
    });

    try {
      await this.memberRepository.save(member);
      await this.pastorRepository.save(pastor);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return pastor;
  }

  //* DELETE FOR ID
  // TODO : tomorrow 26/11 seguir con tabla copastor y hace relaciones con pastor (Conteo) ver excel
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
      await this.memberRepository.save(member);
      await this.pastorRepository.save(pastor);
    } catch (error) {
      this.logger.error(error);
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

      const pastorMembers = members.filter((member) =>
        member.roles.includes('pastor'),
      );

      if (pastorMembers.length === 0) {
        throw new NotFoundException(`Not found member with roles 'Pastor'`);
      }

      const pastores = await this.pastorRepository.find();

      const newPastorMembers = pastorMembers.map((member) => {
        const newPastores = pastores.filter(
          (pastor) => pastor.member.id === member.id,
        );
        return newPastores;
      });

      const arrayAplanado = newPastorMembers.flat();

      if (arrayAplanado.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term.slice(0, -1)}`,
        );
      }

      return arrayAplanado;
    }

    //* Para find by last_name
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
          (pastor) => pastor.member.id === member.id,
        );
        return newPastores;
      });

      const arrayAplanado = newPastorMembers.flat();

      if (arrayAplanado.length === 0) {
        throw new NotFoundException(
          `Not found pastor with these names ${term
            .split('-')
            .map((word) => word.slice(0, -1))
            .join(' ')}`,
        );
      }

      return arrayAplanado;
    }
  };
}
