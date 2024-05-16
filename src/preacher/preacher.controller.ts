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

import { Preacher } from '@/preacher/entities';
import { PreacherService } from '@/preacher/preacher.service';
import { CreatePreacherDto, UpdatePreacherDto } from '@/preacher/dto';

import { ValidUserRoles } from '@/auth/enums';
import { Auth, GetUser } from '@/auth/decorators';

import { User } from '@/user/entities';

@ApiTags('Preachers')
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
@Controller('preachers')
export class PreacherController {
  constructor(private readonly preacherService: PreacherService) {}

  //* Create
  @Post()
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  @ApiCreatedResponse({
    description: 'Preacher has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  create(
    @Body() createPreacherDto: CreatePreacherDto,
    @GetUser() user: User,
  ): Promise<Preacher> {
    return this.preacherService.create(createPreacherDto, user);
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
  findAll(@Query() paginationDto: PaginationDto): Promise<Preacher[]> {
    return this.preacherService.findAll(paginationDto);
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
  ): Promise<Preacher | Preacher[]> {
    return this.preacherService.findTerm(term, searchTypeAndPaginationDto);
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
    @Body() updatePreacherDto: UpdatePreacherDto,
    @GetUser() user: User,
  ): Promise<Preacher> {
    return this.preacherService.update(id, updatePreacherDto, user);
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
    return this.preacherService.remove(id, user);
  }
}
