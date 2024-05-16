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

import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';

import { Auth, GetUser } from '@/auth/decorators';
import { ValidUserRoles } from '@/auth/enums';

import { CreateFamilyHouseDto, UpdateFamilyHouseDto } from '@/family-house/dto';
import { FamilyHouseService } from '@/family-house/family-house.service';

import { User } from '@/user/entities';
import { FamilyHouse } from '@/family-house/entities';

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
export class FamilyHouseController {
  constructor(private readonly familyHouseService: FamilyHouseService) {}

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
    return this.familyHouseService.create(createFamilyHouseDto, user);
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
    return this.familyHouseService.findAll(paginationDto);
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
    return this.familyHouseService.findTerm(term, searchTypeAndPaginationDto);
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
    return this.familyHouseService.update(id, updateFamilyHomeDto, user);
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
    return this.familyHouseService.remove(id, user);
  }
}
