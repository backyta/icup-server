import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth(ValidUserRoles.superUser)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.usersService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(ValidUserRoles.superUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Auth(ValidUserRoles.superUser)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.usersService.delete(id, user);
  }
}
