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
import { CoPastorService } from './copastor.service';

import { CreateCoPastorDto } from './dto/create-copastor.dto';
import { UpdateCoPastorDto } from './dto/update-copastor.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';

@Controller('copastor')
export class CopastorController {
  constructor(private readonly coPastorService: CoPastorService) {}

  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(@Body() createCopastorDto: CreateCoPastorDto, @GetUser() user: User) {
    return this.coPastorService.create(createCopastorDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.coPastorService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.coPastorService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id') id: string,
    @Body() updateCoPastorDto: UpdateCoPastorDto,
    @GetUser() user: User,
  ) {
    return this.coPastorService.update(id, updateCoPastorDto, user);
  }

  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.coPastorService.remove(id, user);
  }
}
