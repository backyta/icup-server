import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { PastorService } from './pastor.service';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';

@Controller('pastor')
export class PastorController {
  constructor(private readonly pastorService: PastorService) {}

  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(@Body() createPastorDto: CreatePastorDto, @GetUser() user: User) {
    return this.pastorService.create(createPastorDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pastorService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.pastorService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id') id: string,
    @Body() updatePastorDto: UpdatePastorDto,
    @GetUser() user: User,
  ) {
    return this.pastorService.update(id, updatePastorDto, user);
  }

  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.pastorService.remove(id, user);
  }
}
