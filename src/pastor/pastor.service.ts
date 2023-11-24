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
import { UpdateMemberDto } from '../members/dto/update-member.dto';

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,
  ) {}

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
        //TODO : sacar conteo por id (table copastor)
        countCopastor: 5,
        created_at: new Date(),
        created_by: 'Kevin',
      });

      return await this.pastorRepository.save(pastorInstance);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //TODO : TRABAJAR EN LA PAGINACION FACIL Y HACER BUSQUEDA SENCILLA POR ID Y NOMBRE APELLIDO DE PASTOR (COPIAR)

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pastorRepository.find({
      take: limit,
      skip: offset,
    });
  }

  //* TERM : id, nombre, apellido
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

  // TODO : para tomorrow 25/11/23
  //* UPDATE FOR ID (NO SE NECESITARIA o SI ?)
  //* Se buscar por nombre o nombre completo, se recibe la info y se pinta en pantalla, se genera una tabla
  //* visual con boton que diga ver mas o eliminar, en boton ver mas mandamos el ID de pastor, como peticion
  //* y buscamos por id en el endpint de pastor/:term , devuelve una informacion y pintamos una pantalla
  //* de presentacion con toda la infor del pastor y su miembro asosciado.
  //! Al hacer click en actualizar mandamos el member id, y nos manda a una pantalla para actualizar la data
  //! del miembro, y al actualizat esta data la del pastor asociado al miembro tmb se actualiza segun el id

  //? Problemas, cambiar al pastor por su id de miembro que se asigno al crear

  // La otra opcion seria hacer la ruta de actualizacion de pastor solo con el miembro id, y pregunrar si
  // se quiere seleccionar otro id de miembro para este pastor.
  // solo en este caso seria necesario y mas pequenio el endpoint de actualizar pastor.
  // Seria un pequenio boton al costado que indique re-asignar un id de miembro para este pastor.
  // Si hace esto actualizamos todo el ID con el DTO, mas facil, y con el otro boton regirigimos.

  //* Y mas abajo un boton de actualizar al miembro asignado al pastor y al hacer esto el id lo ponemos en
  //* blanco o ocultamos porque sera el mismo.

  async update(id: string, updatePastorDto: UpdatePastorDto) {
    // updatePastorDto.idMember
    // const pastor = await this.pastorRepository.preload({
    //   id: id,
    //   countCopastor: 15,
    //   updated_at: new Date(),
    //   updated_by: 'Kevinxd',
    //   updateMemberDto.
    // });
    // if (!pastor) throw new NotFoundException(`Member with id: ${id} not found`);
    // try {
    //   return await this.memberRepository.save(pastor);
    // } catch (error) {
    //   this.handleDBExceptions(error);
    // }
  }

  //! DELETE: Cuando marque como incativo un pastor, copastor, predicador su isActive del miembro tmb lo hara
  // TODO : agregar campo de is active para eliminar
  remove(id: number) {
    return `This action removes a #${id} pastor`;
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
