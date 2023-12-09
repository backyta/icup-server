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
import { FamilyHome } from 'src/family-home/entities/family-home.entity';

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

    @InjectRepository(FamilyHome)
    private readonly familyHomeRepository: Repository<FamilyHome>,
  ) {}

  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto) {
    const {
      roles,
      their_pastor,
      their_copastor,
      their_preacher,
      their_family_home,
    } = createMemberDto;

    //! Validacion de roles (solo 1 y miembro)
    if (
      (roles.includes('pastor') && roles.includes('copastor')) ||
      (roles.includes('pastor') && roles.includes('preacher')) ||
      (roles.includes('copastor') && roles.includes('pastor')) ||
      (roles.includes('copastor') && roles.includes('preacher')) ||
      (roles.includes('preacher') && roles.includes('pastor')) ||
      (roles.includes('preacher') && roles.includes('copastor'))
    ) {
      throw new BadRequestException(
        `Solo se puede asignar un unico rol principal: ['Pastor, Copastor o Preacher']`,
      );
    }

    //NOTE : desde el front al marcar el rol en pastor ocualtar los otros campos y asi tmb para los demas roles
    //! Validaciones asignacion de their leaders segun rol
    if (
      (roles.includes('pastor') && their_pastor) ||
      (roles.includes('pastor') && their_copastor) ||
      (roles.includes('pastor') && their_preacher) ||
      (roles.includes('pastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `No se puede asignar un Pastor, Copastor, Preacher o Casa Familiar a un miembro con rol Pastor`,
      );
    }

    if (
      (roles.includes('copastor') && their_copastor) ||
      (roles.includes('copastor') && their_preacher) ||
      (roles.includes('copastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `No se puede asignar un Copastor, Preacher o Casa Familiar a un miembro con rol Copastor`,
      );
    }

    if (roles.includes('preacher') && their_preacher) {
      throw new BadRequestException(
        `No se puede asignar un preacher a un miembro con rol Preacher`,
      );
    }

    //* Validaciones Pastor, Copastor, Preacher, Casa
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
    if (!their_preacher) {
      preacher = null;
    } else {
      preacher = await this.preacherRepository.findOneBy({
        id: their_preacher,
      });
    }

    let familyHome: FamilyHome;
    if (!their_family_home) {
      familyHome = null;
    } else {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
    }

    //* Creaccion de Instancia
    try {
      const member = this.memberRepository.create({
        ...createMemberDto,
        their_copastor: copastor,
        their_pastor: pastor,
        their_preacher: preacher,
        their_family_home: familyHome,
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
      relations: [
        'their_pastor_id',
        'their_copastor_id',
        'their_family_home',
        'their_preacher',
      ],
    });
  }

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
        relations: [
          'their_copastor_id',
          'their_pastor_id',
          'their_preacher',
          'their_family_home',
        ],
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

    //* Find Members for their_copastor --> Many
    if (isUUID(term) && type === SearchType.their_copastor) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.their_preacher = :term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No se encontro Members con este their_copastor : ${term} `,
        );
      }
    }

    //* Find Members for their_preacher --> Many
    if (isUUID(term) && type === SearchType.their_preacher) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.their_copastor = :term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No se encontro Members con este their_preacher : ${term} `,
        );
      }
    }

    //* Find Members for their_FamilyHome --> Many
    if (isUUID(term) && type === SearchType.their_family_home) {
      member = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.their_family_home = :term', { term })
        .skip(offset)
        .limit(limit)
        .getMany();

      if (member.length === 0) {
        throw new BadRequestException(
          `No se encontro Members con este their_family_home : ${term} `,
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
    const {
      roles,
      their_copastor,
      their_pastor,
      their_preacher,
      their_family_home,
      is_active,
    } = updateMemberDto;

    //TODO : poner por defecto a member en todos los roles acompaniados.

    if (!roles) {
      throw new BadRequestException(`Asignar roles para actualizar al miembro`);
    }
    if (is_active === undefined) {
      throw new BadRequestException(
        `Debe asignar un valor booleano a is_Active`,
      );
    }

    //NOTE: no se necesitaria todas las validaciones si ponemos como obligatorio los their(Revisar)
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataMember = await this.memberRepository.findOne({
      where: { id: id },
      relations: [
        'their_pastor',
        'their_copastor',
        'their_preacher',
        'their_family_home',
      ],
    });

    if (!dataMember) {
      throw new NotFoundException(`Member not found with id: ${id}`);
    }

    //NOTE : ver si es factible bajar de nivel a un rol(seria ams dificil hacer esto que subirlo)
    //TODO : hacer estas validaciones por roles que tenga el dataMember.
    //* Si dataMember tiene el rol de pastor, quiere decir que tiene todo los their en null.
    //* Si tie rol de copastor quiere decir que tiene solo their_pastor.
    //* Si tiene rol de preacher tiene their_copastor y their_pastor y their_casa.
    //* Si es member o tesorero tiene todos los their.

    //! Esto esta bien pero cuando se actualize algo con rol pastor no tendra their_pastor.id su dataMember
    //! Por otro lado solo actualizaria su casa a los que son preacher o members.

    //* Validacion de roles (solo 1 y miembro)
    if (
      (roles.includes('pastor') && roles.includes('copastor')) ||
      (roles.includes('pastor') && roles.includes('preacher')) ||
      (roles.includes('copastor') && roles.includes('pastor')) ||
      (roles.includes('copastor') && roles.includes('preacher')) ||
      (roles.includes('preacher') && roles.includes('pastor')) ||
      (roles.includes('preacher') && roles.includes('copastor'))
    ) {
      throw new BadRequestException(
        `Solo se puede asignar un unico rol principal: ['Pastor, Copastor o Preacher']`,
      );
    }

    //* Validacion al actualizar roles(del miembro)
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

    if (dataMember.roles.includes('preacher') && roles.includes('pastor')) {
      throw new BadRequestException(
        `No se puede asignar un rol superior sin pasar por la jerarquia : [pracher, copastor, pastor]`,
      );
    }

    //* Validaciones asignacion de their leaders segun rol
    //NOTE : ir ocultando los their que sean necesarios y mostrar lo que si segun el rol(front)
    if (
      (roles.includes('pastor') && their_pastor) ||
      (roles.includes('pastor') && their_copastor) ||
      (roles.includes('pastor') && their_preacher) ||
      (roles.includes('pastor') && their_family_home)
    ) {
      throw new BadRequestException(
        `No se puede asignar un Pastor, Copastor, Preacher o Casa Familiar a un miembro con rol Pastor`,
      );
    }

    if (
      ((roles.includes('copastor') && their_copastor) ||
        (roles.includes('copastor') && their_preacher) ||
        (roles.includes('copastor') && their_family_home)) &&
      !their_pastor
    ) {
      throw new BadRequestException(
        `No se puede asignar un Copastor, Preacher o Casa Familiar a un miembro con rol Copastor, solo se puede asignar Pasor`,
      );
    }

    if (
      roles.includes('preacher') &&
      (their_preacher || !their_copastor || !their_pastor || !their_family_home)
    ) {
      throw new BadRequestException(
        `No se puede asignar un preacher a un miembro con rol Preacher, solo se puede asignar Pastor, Copastor, y Casa Familiar`,
      );
    }

    //* Validacion Pastor
    //! Al subir de nivel
    //! Arreglar aqui, para validar al actualizar agarre el mismo pastor o copastor si sube de nivel.

    let pastor: Pastor;
    let copastor: CoPastor;
    let preacher: Preacher;
    let familyHome: FamilyHome;
    let member: Member;

    //* Validacion Pastor (Si pastor se mantiene en rol pastor)
    if (dataMember.roles.includes('pastor') && roles.includes('pastor')) {
      pastor = null;
      copastor = null;
      preacher = null;
      familyHome = null;

      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //* Validacion Pastor (Si copastor sube a rol pastor)
    if (dataMember.roles.includes('copastor') && roles.includes('pastor')) {
      pastor = null;
      copastor = null;
      preacher = null;
      familyHome = null;

      //! borrar registro de copastor?, no se puede por llave con member.
      //! Otra cosa sera que al subir de nievle se cree automaticamente el pastor.
      //! En copastor tendria que colocar en nullsu id_member y pastor.
      //! Colocarle null a todas las foreing keys que tenga.
      //! Despues de quitar todas recine borrar al copastor
      //! Despues crear al nuevo copastor o asignar uno que ya tenamos y despues proceder actualizar las demas tablas
      //! Por cada actualizacion en tabla se tomara del preacher o copastor nuevo asignado sus their para setearlo
      //! y que guarden relacion.

      //TODO : hacer esto tomorrow 10/12 (solo cuando sube de nivel), si se mantiene el rol solo setear y donde tenga ref.
      const dataCopastor = await this.coPastorRepository.preload({
        id: dataMember.their_copastor.id,
        their_pastor: pastor,
      });

      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //* Validacion CoPastor (Si copastor se mantiene en rol copastor)
    if (dataMember.roles.includes('copastor') && roles.includes('copastor')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;

      const dataCopastor = await this.coPastorRepository.preload({
        id: dataMember.their_copastor.id,
        their_pastor: pastor,
      });

      member = await this.memberRepository.preload({
        id: id,
        ...updateMemberDto,
        updated_at: new Date(),
        // NOTE: cambiar por uuid en relacion con User
        updated_by: 'Kevinxd',
        their_pastor: pastor,
        their_copastor: copastor,
        their_preacher: preacher,
        their_family_home: familyHome,
      });

      try {
        await this.coPastorRepository.save(dataCopastor);
        return await this.memberRepository.save(member);
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }

    //* Validacion CoPastor (Si copastor sube a pastor)
    if (
      (dataMember.roles.includes('copastor') && roles.includes('copastor')) ||
      (dataMember.roles.includes('preacher') && roles.includes('copastor'))
      //! Setear en copastor el nuevo id de pastor.
      //! Borrar el preacher porque no debe existir, si sube de rango.
    ) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = null;
      preacher = null;
      familyHome = null;
    }

    //* Validacion Preacher
    if (
      (dataMember.roles.includes('preacher') && roles.includes('pracher')) ||
      (dataMember.roles.includes('member') && roles.includes('preacher'))
    ) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
      preacher = null;
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
    }

    //* Validacion Only Member
    if (dataMember.roles.includes('member') && roles.includes('member')) {
      pastor = await this.pastorRepository.findOneBy({
        id: their_pastor,
      });
      copastor = await this.coPastorRepository.findOneBy({
        id: their_copastor,
      });
      preacher = await this.preacherRepository.findOneBy({
        id: their_copastor,
      });
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
    }

    //* Validacion Family Home
    if (!their_family_home) {
      familyHome = null;
    } else {
      familyHome = await this.familyHomeRepository.findOneBy({
        id: their_family_home,
      });
    }

    //! Asignacion de data si es pastor

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
        their_family_home: null,
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
        their_family_home: null,
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
        their_family_home: null,
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
        their_family_home: familyHome,
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
        their_family_home: null,
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
        their_family_home: familyHome,
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
        their_family_home: familyHome,
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
