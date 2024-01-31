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

import { CoPastorsService } from './copastors.service';

import { CreateCoPastorDto } from './dto/create-copastor.dto';
import { UpdateCoPastorDto } from './dto/update-copastor.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';
import { CoPastor } from './entities/copastor.entity';

@ApiTags('Co-Pastors')
@Controller('copastors')
export class CopastorsController {
  constructor(private readonly coPastorsService: CoPastorsService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(
    @Body() createCopastorDto: CreateCoPastorDto,
    @GetUser() user: User,
  ): Promise<CoPastor> {
    return this.coPastorsService.create(createCopastorDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<CoPastor[]> {
    return this.coPastorsService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<CoPastor | CoPastor[]> {
    return this.coPastorsService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCoPastorDto: UpdateCoPastorDto,
    @GetUser() user: User,
  ): Promise<CoPastor> {
    return this.coPastorsService.update(id, updateCoPastorDto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.coPastorsService.remove(id, user);
  }
}
