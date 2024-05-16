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

import { Pastor } from '@/pastor/entities';
import { PastorService } from '@/pastor/pastor.service';
import { CreatePastorDto, UpdatePastorDto } from '@/pastor/dto';

import { Auth, GetUser } from '@/auth/decorators';
import { ValidUserRoles } from '@/auth/enums';

import { User } from '@/user/entities';

@ApiTags('Pastors')
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
@Controller('pastors')
export class PastorController {
  constructor(private readonly pastorService: PastorService) {}

  //* Create
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiCreatedResponse({
    description: 'Pastor has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createPastorDto: CreatePastorDto,
    @GetUser() user: User,
  ): Promise<Pastor> {
    return this.pastorService.create(createPastorDto, user);
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
  findAll(@Query() paginationDto: PaginationDto): Promise<Pastor[]> {
    return this.pastorService.findAll(paginationDto);
  }

  //* Find By Term
  @Get(':term')
  @Auth()
  @ApiParam({
    name: 'term',
    description: 'Could be id, names, code, roles, etc.',
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
  ): Promise<Pastor | Pastor[]> {
    return this.pastorService.findTerm(term, searchTypeAndPaginationDto);
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
    @Body() updatePastorDto: UpdatePastorDto,
    @GetUser() user: User,
  ): Promise<Pastor> {
    return this.pastorService.update(id, updatePastorDto, user);
  }

  //* Delete
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.pastorService.remove(id, user);
  }
}
