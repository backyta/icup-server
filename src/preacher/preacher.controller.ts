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
import { PreacherService } from './preacher.service';
import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth, GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';

@Controller('preachers')
export class PreacherController {
  constructor(private readonly preacherService: PreacherService) {}

  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(@Body() createPreacherDto: CreatePreacherDto, @GetUser() user: User) {
    return this.preacherService.create(createPreacherDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.preacherService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.preacherService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePreacherDto: UpdatePreacherDto,
    @GetUser() user: User,
  ) {
    return this.preacherService.update(id, updatePreacherDto, user);
  }

  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.preacherService.remove(id, user);
  }
}
