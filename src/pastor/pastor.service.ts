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

@Injectable()
export class PastorService {
  private readonly logger = new Logger('PastorService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,
  ) {}

  //! Manejar error de enviar cualquier otra cosa que no sea numero asdasda en el body
  async create(createPastorDto: CreatePastorDto): Promise<Pastor> {
    const { idMember } = createPastorDto;

    const member1: Member = await this.memberRepository.findOneBy({
      id: idMember,
    });

    if (!member1)
      throw new NotFoundException(`Member with id: ${idMember} not found`);

    if (!member1.roles.includes('pastor')) {
      throw new BadRequestException(
        `This member cannot be assigned as Pastor, his role must contain: ["pastor"]`,
      );
    }

    try {
      const pastorInstance = this.pastorRepository.create({
        member: member1,
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
  //* Intentar usar la validacion del modulo miembros aqui proque todo ya esta hecho ( servicio ) revisar
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

      const ageMiliSeconds = Date.now() - new Date(pastor.member.age).getTime();
      const ageDate = new Date(ageMiliSeconds);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      pastor.member.age = age;

      await this.pastorRepository.save(pastor);
    }

    //* Find firstName --> One
    //TODO : terminar este trabajo
    //! Buscar por nombre relacionado en el idMiembro del Pastor y que tenga ROL PASTOR
    if (term && type === SearchType.firstName) {
      //! Ahora se debe exportar de searchPerson de helper
      const member: Member | Member[] = await searchPerson({
        term,
        searchType: SearchType.firstName,
        limit,
        offset,
        repository: this.memberRepository,
      });
      //TODO : Si el member tiene rol de pastor se retorna, solo los que tiene ese rol

      console.log(member);
    }
    //* Find lastName --> One
    //* Find fullName --> One

    //! Cuando marque como incativo un pastor, copastor, predicador su isActive del miembro tmb lo hara

    return pastor;
  }

  update(id: number, updatePastorDto: UpdatePastorDto) {
    return `This action updates a #${id} pastor`;
  }

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
}
