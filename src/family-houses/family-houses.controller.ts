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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FamilyHousesService } from './family-houses.service';
import { CreateFamilyHouseDto } from './dto/create-family-house.dto';
import { UpdateFamilyHouseDto } from './dto/update-family-house.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';
import { FamilyHouse } from './entities/family-house.entity';

@ApiTags('Family-Houses')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error, check logs.',
})
@ApiBadRequestResponse({
  description: 'Bad request.',
})
@Controller('family-houses')
export class FamilyHousesController {
  constructor(private readonly familyHousesService: FamilyHousesService) {}

  //* Create
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiCreatedResponse({
    description: 'Family House has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createFamilyHouseDto: CreateFamilyHouseDto,
    @GetUser() user: User,
  ): Promise<FamilyHouse> {
    return this.familyHousesService.create(createFamilyHouseDto, user);
  }

  //* Find All
  @Get()
  @Auth()
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<FamilyHouse[]> {
    return this.familyHousesService.findAll(paginationDto);
  }

  //* Find By Term
  @Get(':term')
  @Auth()
  @ApiParam({
    name: 'term',
    description: 'Could be id, names, code, roles, zone, etc.',
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<FamilyHouse | FamilyHouse[]> {
    return this.familyHousesService.findTerm(term, searchTypeAndPaginationDto);
  }

  //* Update
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyHomeDto: UpdateFamilyHouseDto,
    @GetUser() user: User,
  ): Promise<FamilyHouse> {
    return this.familyHousesService.update(id, updateFamilyHomeDto, user);
  }

  //* Delete
  @Delete(':id')
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.familyHousesService.remove(id, user);
  }
}
