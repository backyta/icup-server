import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PreachersService } from './preachers.service';
import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth, GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';
import { Preacher } from './entities/preacher.entity';
@ApiTags('Preachers')
@Controller('preachers')
export class PreachersController {
  constructor(private readonly preachersService: PreachersService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(
    @Body() createPreacherDto: CreatePreacherDto,
    @GetUser() user: User,
  ): Promise<Preacher> {
    return this.preachersService.create(createPreacherDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<Preacher[]> {
    return this.preachersService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Preacher | Preacher[]> {
    return this.preachersService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePreacherDto: UpdatePreacherDto,
    @GetUser() user: User,
  ): Promise<Preacher> {
    return this.preachersService.update(id, updatePreacherDto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.preachersService.remove(id, user);
  }
}
