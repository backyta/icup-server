import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

import { SearchType } from '../common/enums/search-types.enum';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { searchPerson, searchFullname, updateAge } from '../common/helpers';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Preacher } from 'src/preacher/entities/preacher.entity';

@Injectable()
export class MembersService {
  private readonly logger = new Logger('MermbersService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,
  ) {}

  // TODO : unir a rama main el preacher y empezar con casa familiar
  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto) {
    const { roles, their_pastor, their_copastor, their_preacher } =
      createMemberDto;

    //! Validacion de roles
    if (
      (roles.includes('pastor') && roles.includes('copastor')) ||
      (roles.includes('pastor') && roles.includes('preacher'))
    ) {
      throw new BadRequestException(`No se puede asignar una jerarquia menor`);
    }

    if (roles.includes('copastor') && roles.includes('preacher')) {
      throw new BadRequestException(`No se puede asignar una jerarquia menor`);
    }

    if (roles.includes('pastor') && their_pastor) {
      throw new BadRequestException(
        `No se puede asignar un Pastor a un miembro con rol Pastor`,
      );
    }

    //! Validacion de roles y theirs leaders
    if (
      (roles.includes('pastor') && their_copastor) ||
      (roles.includes('pastor') && their_preacher)
    ) {
      throw new BadRequestException(
        `No se puede asignar un CoPastor o Preacher a un miembro con rol Pastor`,
      );
    }

    if (roles.includes('copastor') && their_copastor) {
      throw new BadRequestException(
        `No se puede asignar un coPastor a un miembro con rol coPastor`,
      );
    }

    if (
      (roles.includes('copastor') && their_copastor) ||
      (roles.includes('copastor') && their_preacher)
    ) {
      throw new BadRequestException(
        `No se puede asignar un coPastor o Preacher a un miembro con rol coPastor`,
      );
    }

    if (roles.includes('preacher') && their_preacher) {
      throw new BadRequestException(
        `No se puede asignar un Preacher a un miembro con rol Preacher`,
      );
    }

    //TODO : falta hacer su casa.
    //* Validaciones Pastor, Copastor, Preacher
    let pastor: Pastor;
    if (!their_pastor) {
      pastor = null;
    } else {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
    }

    let copastor: CoPastor;
    if (!their_copastor) {
      copastor = null;
    } else {
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
    }

    let preacher: Preacher;
    if (!preacher) {
      preacher = null;
    } else {
      preacher = await this.preacherRepository.findOneBy({
        id: their_preacher,
      });
    }

    try {
      const member = this.memberRepository.create({
        ...createMemberDto,
        their_copastor: copastor,
        their_pastor: pastor,
        their_preacher: preacher,
        // NOTE: cambiar por uuid en relacion con User
        created_at: new Date(),
        created_by: 'Kevin',
      });
      await this.memberRepository.save(member);

      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* FIND ALL (PAGINATED) boton flecha y auemtar el offset de 10 o 20.
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.memberRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
      relations: ['their_pastor_id', 'their_copastor_id'],
    });
  }

  // TODO : agregar casa a la relacion
  //* FIND POR TERMINO Y TIPO DE BUSQUEDA (FILTRO)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    const { type, limit = 20, offset = 0 } = searchTypeAndPaginationDto;
    let member: Member | Member[];

    //* Find UUID --> One
    if (isUUID(term) && type === SearchType.id) {
      member = await this.memberRepository.findOne({
        where: { id: term },
        relations: ['their_copastor_id', 'their_pastor_id', 'their_preacher'],
      });

      if (!member) {
        throw new BadRequestException(`No se encontro Pastor con este UUID`);
      }
      if (!member.is_active) {
        throw new BadRequestException(`Member should is active`);
      }

      member.age = updateAge(member);
      await this.memberRepository.save(member);
    }

    //* Find gender --> Many
    if (term && type === SearchType.gender) {
      member = await this.findMembersWithPagination(
        SearchType.gender,
        term,
        limit,
        offset,
      );
    }

    //* Find maritalStatus --> Many
    if (term && type === SearchType.maritalStatus) {
      member = await this.findMembersWithPagination(
        SearchType.maritalStatus,
        term,
        limit,
        offset,
      );
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      member = await this.findMembersWithPagination(
        SearchType.isActive,
        term,
        limit,
        offset,
      );
    }

    //* Find firstName --> Many
    if (term && type === SearchType.firstName) {
      member = await searchPerson({
        term,
        searchType: SearchType.firstName,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find lastName --> Many
    if (term && type === SearchType.lastName) {
      member = await searchPerson({
        term,
        searchType: SearchType.lastName,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find fullName --> Many
    if (term && type === SearchType.fullName) {
      member = await searchFullname({
        term,
        limit,
        offset,
        repository: this.memberRepository,
      });
    }

    //* Find roles --> Many
    if (term && type === SearchType.roles) {
      const rolesArray = term.split('-');
      console.log(rolesArray);

      member = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.roles @> ARRAY[:...roles]::text[]', {
          roles: rolesArray,
        })
        .skip(offset)
        .andWhere(`member.is_active =:isActive`, { isActive: true })
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `Not found members with these roles: ${rolesArray}`,
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

    if (!member) throw new NotFoundException(`Member with ${term} not found`);

    return member;
  }

  //* UPDATE FOR ID
  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const { roles, their_copastor, their_pastor, their_preacher } =
      updateMemberDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataMember = await this.memberRepository.findOneBy({ id });

    if (!dataMember) {
      throw new NotFoundException(`Member not found with id: ${id}`);
    }

    //* Validacion Pastor
    let pastor: Pastor;
    if (!their_pastor) {
      pastor = await this.pastorRepository.findOneBy({
        id: dataMember.their_pastor.id,
      });
    } else {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
    }

    if (!pastor) {
      throw new NotFoundException(`Pastor Not found with id ${their_pastor}`);
    }

    //* Validacion CoPastor
    let copastor: CoPastor;
    if (!their_copastor) {
      copastor = await this.coPastorRepository.findOneBy({
        id: dataMember.their_copastor.id,
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

    //* Validacion Preacher
    let preacher: Preacher;
    if (!their_preacher) {
      preacher = await this.preacherRepository.findOneBy({
        id: dataMember.their_preacher.id,
      });
    } else {
      preacher = await this.preacherRepository.findOneBy({
        id: their_preacher,
      });
    }

    if (!preacher) {
      throw new NotFoundException(
        `CoPastor Not found with id ${their_preacher}`,
      );
    }

    //* Validacion de roles

    if (
      (dataMember.roles.includes('pastor') && roles.includes('copastor')) ||
      (dataMember.roles.includes('pastor') && roles.includes('preacher'))
    ) {
      throw new BadRequestException(
        `No se puede asignar un rol inferior a Pastor`,
      );
    }

    if (dataMember.roles.includes('copastor') && roles.includes('preacher')) {
      throw new BadRequestException(
        `No se puede asignar un rol inferior a CoPastor`,
      );
    }

    //! Asignacion de data si es pastor
    let member: Member;

    if (dataMember.roles.includes('pastor') && roles.includes('pastor')) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_copastor: null,
        their_pastor: null,
        their_preacher: null,
      });
    }

    //! Asignacion de data si es coPastor
    if (dataMember.roles.includes('copastor') && roles.includes('copastor')) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: null,
        their_preacher: null,
      });
    }

    //* Si un coPastor se transforma a Pastor
    if (
      dataMember.roles.includes('copastor') &&
      !roles.includes('copastor') &&
      roles.includes('pastor')
    ) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: null,
        their_copastor: null,
        their_preacher: null,
      });
    }

    //! Asignacion de data si es Pracher
    if (dataMember.roles.includes('preacher') && roles.includes('preacher')) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: null,
      });
    }

    //* Si un Preacher se transforma a CoPastor
    if (
      dataMember.roles.includes('preacher') &&
      !roles.includes('preacher') &&
      roles.includes('copastor')
    ) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: null,
        their_preacher: null,
      });
    }

    //! Asignacion de data si es Member
    if (dataMember.roles.includes('member') && roles.includes('member')) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
      });
    }

    //* Si un Member se transforma a Preacher
    if (dataMember.roles.includes('member') && roles.includes('preacher')) {
      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: null,
      });
    }

    if (!member) {
      throw new NotFoundException(`Member with id: ${id} not found`);
    }

    try {
      return await this.memberRepository.save(member);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* ELIMINAR POR ID
  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataMember = await this.memberRepository.findOneBy({ id: id });
    if (!dataMember) {
      throw new BadRequestException(`Member with id ${id} not exist`);
    }

    const member = await this.memberRepository.preload({
      id: id,
      is_active: false,
    });

    if (dataMember.roles.includes('pastor')) {
      const pastores = await this.pastorRepository.find();
      const pastorMember = pastores.find((pastor) => pastor.member.id === id);
      if (!pastorMember) {
        throw new NotFoundException(`Not found pastor`);
      }
      const pastor = await this.pastorRepository.preload({
        id: pastorMember.id,
        is_active: false,
      });

      try {
        await this.memberRepository.save(member);
        await this.pastorRepository.save(pastor);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    if (member.roles.includes('copastor')) {
      const coPastores = await this.coPastorRepository.find();
      const coPastorMember = coPastores.find(
        (coPastor) => coPastor.member.id === id,
      );

      if (!coPastorMember) {
        throw new NotFoundException(`Not found pastor`);
      }

      const coPastor = await this.coPastorRepository.preload({
        id: coPastorMember.id,
        is_active: false,
      });

      try {
        await this.memberRepository.save(member);
        await this.pastorRepository.save(coPastor);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    if (member.roles.includes('preacher')) {
      const preachers = await this.preacherRepository.find();
      const preacherMember = preachers.find(
        (preacher) => preacher.member.id === id,
      );

      if (!preacherMember) {
        throw new NotFoundException(`Not found pastor`);
      }

      const preacher = await this.preacherRepository.preload({
        id: preacherMember.id,
        is_active: false,
      });

      try {
        await this.memberRepository.save(member);
        await this.pastorRepository.save(preacher);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }

  //! PRIVATE METHODS
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  private async findMembersWithPagination(
    searchType: string,
    term: string,
    limit: number,
    offset: number,
  ): Promise<Member[]> {
    const whereCondition = {};
    if (searchType === 'is_active') {
      try {
        whereCondition[searchType] = term;

        const members = await this.memberRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          relations: ['their_pastor_id', 'their_copastor_id'],
        });

        if (members.length === 0) {
          throw new NotFoundException(
            `Not found member with these names: ${term}`,
          );
        }
        return members;
      } catch (error) {
        throw new BadRequestException(`This term is not a valid boolean value`);
      }
    }

    whereCondition[searchType] = term;
    whereCondition['is_active'] = true;

    const members = await this.memberRepository.find({
      where: [whereCondition],
      take: limit,
      skip: offset,
      relations: ['their_pastor_id', 'their_copastor_id'],
    });

    if (members.length === 0) {
      throw new NotFoundException(`Not found member with these names: ${term}`);
    }
    return members;
  }
}
