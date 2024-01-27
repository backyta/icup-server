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

import { User } from './entities/user.entity';

import { UpdateUserDto } from './dto/update-user.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';
import { SearchType } from '../common/enums/search-types.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //* FIND ALL (PAGINATED)
  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.userRepository.find({
      where: { is_active: true },
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
  }

  //* FIND BY SEARCH TERM AND TYPE (FILTER)
  async findTerm(
    term: string,
    searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<User[] | User> {
    const {
      type,
      limit = 20,
      offset = 0,
      type_of_name,
    } = searchTypeAndPaginationDto;
    let member: User | User[];

    //* Find UUID --> One (inactive or active)
    if (isUUID(term) && type === SearchType.id) {
      member = await this.userRepository.findOne({
        where: { id: term },
      });

      if (!member) {
        throw new NotFoundException(`Pastor was not found with this UUID`);
      }
    }

    //* Find isActive --> Many
    if (term && type === SearchType.isActive) {
      const whereCondition = {};
      try {
        whereCondition[type] = term;

        const users = await this.userRepository.find({
          where: [whereCondition],
          take: limit,
          skip: offset,
          order: { created_at: 'ASC' },
        });

        if (users.length === 0) {
          throw new NotFoundException(`Not found Users with this: ${term}`);
        }
        return users;
      } catch (error) {
        if (error.code === '22P02') {
          throw new BadRequestException(
            `This term is not a valid boolean value`,
          );
        }

        throw error;
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

    if (
      term &&
      (SearchType.firstName || SearchType.lastName || SearchType.fullName) &&
      !type_of_name
    ) {
      throw new BadRequestException(
        `To search by names, the query_type is required`,
      );
    }

    if (!member) throw new NotFoundException(`Member with ${term} not found`);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    user: User,
  ): Promise<User> {
    const { is_active } = updateUserDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataUser = await this.userRepository.findOneBy({ id });

    if (!dataUser) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    try {
      const updateUser = await this.userRepository.preload({
        id: id,
        ...updateUserDto,
        is_active: is_active,
        updated_at: new Date(),
        updated_by: user,
      });

      return await this.userRepository.save(updateUser);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Not valid UUID`);
    }

    const dataUser = await this.userRepository.findOneBy({ id });

    if (!dataUser) {
      throw new NotFoundException(`Pastor with id: ${id} not exits`);
    }

    try {
      const deteteUser = await this.userRepository.preload({
        id: dataUser.id,
        is_active: false,
        updated_at: new Date(),
        updated_by: user,
      });

      await this.userRepository.save(deteteUser);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //! PRIVATE METHODS
  //* For future index errors or constrains with code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }

  //! DELETE FOR SEED
  async deleteAllUsers() {
    const query = this.userRepository.createQueryBuilder('users');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
