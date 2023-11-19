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
  async findOne(id: string) {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) throw new NotFoundException(`Product with ${id} not found`);

    return member;
  }

  //* ACTUALIZAR POR ID Y PAYLOAD
  update(id: string, updateMemberDto: UpdateMemberDto) {
    console.log(updateMemberDto);

    return `This action updates a #${id} member`;
  }

  //* ELIMINAR POR ID
  async remove(id: string) {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member); //? deberia ser como una actualizacion para marcar como inactivo
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
