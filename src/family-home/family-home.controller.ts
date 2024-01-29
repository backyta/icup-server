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

import { FamilyHomeService } from './family-home.service';
import { CreateFamilyHomeDto } from './dto/create-family-home.dto';
import { UpdateFamilyHomeDto } from './dto/update-family-home.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';

@Controller('family-home')
export class FamilyHomeController {
  constructor(private readonly familyHomeService: FamilyHomeService) {}

  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(
    @Body() createFamilyHomeDto: CreateFamilyHomeDto,
    @GetUser() user: User,
  ) {
    return this.familyHomeService.create(createFamilyHomeDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.familyHomeService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.familyHomeService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyHomeDto: UpdateFamilyHomeDto,
    @GetUser() user: User,
  ) {
    return this.familyHomeService.update(id, updateFamilyHomeDto, user);
  }

  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.familyHomeService.remove(id, user);
  }
}
