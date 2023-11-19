import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { ValidRoles } from './enums/valid-roles.enum';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { QueryTypeDto } from 'src/common/dtos';
import { QueryType } from './enums/query-types.enum';

@Injectable()
export class MembersService {
  private readonly logger = new Logger('MermbersService');

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  //* CREATE MEMBER
  async create(createMemberDto: CreateMemberDto) {
    const validRoles = Object.values(ValidRoles);

    createMemberDto.roles.map((rol) => {
      if (!validRoles.includes(rol as ValidRoles)) {
        throw new BadRequestException(
          `Not valid role, use the following: ${validRoles}`,
        );
      }
    });

    try {
      const member = this.memberRepository.create(createMemberDto);
      await this.memberRepository.save(member);

      return member;
    } catch (error) {
      console.log(error);
      this.handleDBExceptions(error);
    }
  }

  //* BUSCAR TODOS (FILTRO Y PAGINADO)
  //TODO : Paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.memberRepository.find({
      take: limit,
      skip: offset,
      //TODO : relaciones
    });
  }

  //* BUSCAR POR ID
  //TODO : agregar el tipo de busqueda
  // separar en partes por espacio y buscar por unidad o hacer consulta general de SQL
  async findOne(term: string, searchType: QueryTypeDto) {
    const { type } = searchType;
    let member: Member | Member[];

    if (isUUID(term) && type === QueryType.id) {
      member = await this.memberRepository.findOneBy({ id: term });
    }

    if (term && type === QueryType.gender) {
      member = await this.memberRepository.findBy({ gender: term });
    }

    if (term && type === QueryType.maritalStatus) {
      member = await this.memberRepository.findBy({ maritalStatus: term });
    }

    if (term && type === QueryType.roles) {
      // todo : hacer bsuqueda por varios roles que se pasaran separar por espacio o -
      member = await this.memberRepository
        .createQueryBuilder('member')
        .where(':role = ANY(member.roles)', { role: term })
        .getMany();
    }

    //TODO : hacer type de Relacion (Copastor x id)

    if (term && type === QueryType.fullName) {
      // cortar por guion en el front cortar por espacio y enviar con guien en el query param
      // Hacer el buscador por input apellido y nombre
      const [name, lastName] = term.split('-'); // ver si hay personas con 3 nombres

      const firstName = name.split('+').join(' ');
      const lastNameAp = lastName.split('+').join(' ');

      // const searchWords = namesResult.concat(lastNameResults);

      // console.log(namesResult, lastNameResults);

      // const fullName = word1.concat('-', word2);
      // console.log(word1, word2);
      // console.log(fullName);

      // const word1 = name.replace('+', ' ');
      // const word2 = lastName.replace('+', ' ');

      // console.log({ resultName, resultLastName });

      // const queryBuilder = this.memberRepository.createQueryBuilder();
      // member = await queryBuilder
      //   .where('firstname =:firstname', {
      //     firstname: `${n1} ${n2}`,
      //   })
      //   .andWhere('lastname =:lastname', {
      //     lastname: `${p1} ${p2}`,
      //   })
      //   .getMany();

      // const queryBuilder = this.memberRepository.createQueryBuilder('member');

      // const conditions = searchWords.map((word, index) => {
      //   return `CONCAT_WS(' ', firstname, lastname) ILIKE :searchWord${index} OR
      //     CONCAT_WS(' ', lastname, firstname) ILIKE :searchWord${index}`;
      // });

      // const whereCondition = conditions.join(' OR ');

      // const parameters: { [key: string]: string } = {};
      // searchWords.forEach((word, index) => {
      //   parameters[`searchWord${index}`] = `%${word}%`;
      // });

      // member = await queryBuilder.where(whereCondition, parameters).getOne();

      // console.log(conditions1, conditions2);

      //* AQUI
      const queryBuilder = this.memberRepository.createQueryBuilder();
      member = await queryBuilder
        .where(`firstname ILIKE :searchTerm`, {
          searchTerm: `%${firstName}%`,
        })
        .orWhere(`lastname ILIKE :searchTerm`, {
          searchTerm: `%${lastNameAp}%`,
        })
        .getMany();
      //TODO : handle exception cuando solo se manda el nombre, pedir siempre el apellido.
      //TODO : Manejar cuando regresa array vacio
      //TODO : manejar mayuscilas y minusculaas ver video.
    }

    if (!member) throw new NotFoundException(`Product with ${term} not found`);

    return member;
  }

  //* ACTUALIZAR POR ID Y PAYLOAD
  update(id: string, updateMemberDto: UpdateMemberDto) {
    console.log(updateMemberDto);

    return `This action updates a #${id} member`;
  }

  //* ELIMINAR POR ID
  async remove(id: string) {
    // const member = await this.findOne(id);
    // await this.memberRepository.remove(member); //? deberia ser como una actualizacion para marcar como inactivo
  }

  //* PRIVATE METHODS(para futuros errores de indices o constrains con code)
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }
}
