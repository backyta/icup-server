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

import { PastorsService } from './pastors.service';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';
import { Pastor } from './entities/pastor.entity';

@ApiTags('Pastors')
@Controller('pastors')
export class PastorsController {
  constructor(private readonly pastorsService: PastorsService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(
    @Body() createPastorDto: CreatePastorDto,
    @GetUser() user: User,
  ): Promise<Pastor> {
    return this.pastorsService.create(createPastorDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<Pastor[]> {
    return this.pastorsService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Pastor | Pastor[]> {
    return this.pastorsService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePastorDto: UpdatePastorDto,
    @GetUser() user: User,
  ): Promise<Pastor> {
    return this.pastorsService.update(id, updatePastorDto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.pastorsService.remove(id, user);
  }
}
