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

import { FamilyHousesService } from './family-houses.service';
import { CreateFamilyHouseDto } from './dto/create-family-house.dto';
import { UpdateFamilyHouseDto } from './dto/update-family-house.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';
import { FamilyHouse } from './entities/family-house.entity';

@ApiTags('Family-Houses')
@Controller('family-houses')
export class FamilyHousesController {
  constructor(private readonly familyHousesService: FamilyHousesService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  create(
    @Body() createFamilyHouseDto: CreateFamilyHouseDto,
    @GetUser() user: User,
  ): Promise<FamilyHouse> {
    return this.familyHousesService.create(createFamilyHouseDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<FamilyHouse[]> {
    return this.familyHousesService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<FamilyHouse | FamilyHouse[]> {
    return this.familyHousesService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyHomeDto: UpdateFamilyHouseDto,
    @GetUser() user: User,
  ): Promise<FamilyHouse> {
    return this.familyHousesService.update(id, updateFamilyHomeDto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.familyHousesService.remove(id, user);
  }
}
