import {
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { PaginationDto } from '@/common/dtos/pagination.dto';
import { SearchAndPaginationDto } from '@/common/dtos/search-and-pagination.dto';

import { User } from '@/modules/user/entities/user.entity';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

import { CreateFamilyGroupDto } from '@/modules/family-group/dto/create-family-group.dto';
import { UpdateFamilyGroupDto } from '@/modules/family-group/dto/update-family-group.dto';
import { InactivateFamilyGroupDto } from '@/modules/family-group/dto/inactivate-family-group.dto';

import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';
import { FamilyGroupService } from '@/modules/family-group/family-group.service';

@ApiTags('Family-Groups')
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
@SkipThrottle()
@Controller('family-groups')
export class FamilyGroupController {
  constructor(private readonly familyGroupService: FamilyGroupService) {}

  //* CREATE
  @Post()
  @Auth(UserRole.SuperUser, UserRole.AdminUser)
  @ApiCreatedResponse({
    description: 'Family House has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createFamilyGroupDto: CreateFamilyGroupDto,
    @GetUser() user: User,
  ): Promise<FamilyGroup> {
    return this.familyGroupService.create(createFamilyGroupDto, user);
  }

  //* FIND ALL
  @Get()
  @Auth()
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<FamilyGroup[]> {
    return this.familyGroupService.findAll(paginationDto);
  }

  //* FIND BY TERM
  @Get(':term')
  @Auth()
  @ApiParam({
    name: 'term',
    description: 'Could be names, zones, districts, address, etc.',
  })
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findByTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchAndPaginationDto,
  ): Promise<FamilyGroup[]> {
    return this.familyGroupService.findByTerm(term, searchTypeAndPaginationDto);
  }

  //* UPDATE
  @Patch(':id')
  @Auth(UserRole.SuperUser, UserRole.AdminUser)
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyGroupDto: UpdateFamilyGroupDto,
    @GetUser() user: User,
  ): Promise<FamilyGroup> {
    return this.familyGroupService.update(id, updateFamilyGroupDto, user);
  }

  //! INACTIVATE
  @Delete(':id')
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @Auth(UserRole.SuperUser)
  // @Auth(UserRole.SuperUser, UserRole.AdminUser)
  remove(
    @Param('id') id: string,
    @Query() inactivateFamilyGroupDto: InactivateFamilyGroupDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.familyGroupService.remove(id, inactivateFamilyGroupDto, user);
  }
}
