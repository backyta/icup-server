import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
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

import { DiscipleService } from '@/disciple/disciple.service';

import { Disciple } from '@/disciple/entities';
import { CreateDiscipleDto, UpdateDiscipleDto } from '@/disciple/dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '@/common/dtos';

import { ValidUserRoles } from '@/auth/enums';
import { Auth, GetUser } from '@/auth/decorators';

import { User } from '@/user/entities';

@ApiTags('Members')
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
@Controller('members')
export class DiscipleController {
  constructor(private readonly discipleService: DiscipleService) {}

  //* Create
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiCreatedResponse({
    description: 'Member has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createMemberDto: CreateDiscipleDto,
    @GetUser() user: User,
  ): Promise<Disciple> {
    return this.discipleService.create(createMemberDto, user);
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
  findAll(@Query() paginationDto: PaginationDto): Promise<Disciple[]> {
    return this.discipleService.findAll(paginationDto);
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
  ): Promise<Disciple | Disciple[]> {
    return this.discipleService.findTerm(term, searchTypeAndPaginationDto);
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
    @Body() updateMemberDto: UpdateDiscipleDto,
    @GetUser() user: User,
  ): Promise<Disciple> {
    return this.discipleService.update(id, updateMemberDto, user);
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.discipleService.remove(id, user);
  }
}