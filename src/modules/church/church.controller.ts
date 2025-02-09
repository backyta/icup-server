import {
  Get,
  Post,
  Body,
  Patch,
  Query,
  Param,
  Delete,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
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
import { InactivateChurchDto } from '@/modules/church/dto/inactivate-church.dto';

import { ChurchSearchType } from '@/modules/church/enums/church-search-type.enum';

import { User } from '@/modules/user/entities/user.entity';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

import { ChurchService } from '@/modules/church/church.service';
import { Church } from '@/modules/church/entities/church.entity';
import { CreateChurchDto } from '@/modules/church/dto/create-church.dto';
import { UpdateChurchDto } from '@/modules/church/dto/update-church.dto';

@ApiTags('Churches')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    '🔒 Unauthorized: Missing or invalid Bearer Token. Please provide a valid token to access this resource.',
})
@ApiInternalServerErrorResponse({
  description:
    '🚨 Internal Server Error: An unexpected error occurred on the server. Please check the server logs for more details.',
})
@ApiBadRequestResponse({
  description:
    '❌ Bad Request: The request contains invalid data or parameters. Please verify the input and try again.',
})
@ApiForbiddenResponse({
  description:
    '🚫 Forbidden: You do not have the necessary permissions to access this resource.',
})
@SkipThrottle()
@Controller('churches')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  //* CREATE
  @Post()
  @Auth(UserRole.SuperUser, UserRole.AdminUser)
  @ApiCreatedResponse({
    description:
      '✅ Successfully created: The church has been successfully created and added to the system.',
  })
  create(
    @Body() createChurchDto: CreateChurchDto,
    @GetUser() user: User,
  ): Promise<Church> {
    return this.churchService.create(createChurchDto, user);
  }

  //* FIN MAIN CHURCH
  @Get('main-church')
  @Auth()
  @ApiOkResponse({
    description:
      '✅ Successfully completed: The operation was completed successfully and the response contains the requested data.',
  })
  @ApiNotFoundResponse({
    description:
      '❓ Not Found: The requested resource was not found. Please verify the provided parameters or URL.',
  })
  findMainChurch(@Query() paginationDto: PaginationDto): Promise<Church[]> {
    return this.churchService.findMainChurch(paginationDto);
  }

  //* FIND ALL
  @Get()
  @Auth()
  @ApiOkResponse({
    description:
      '✅ Successfully completed: The operation was completed successfully and the response contains the requested data.',
  })
  @ApiNotFoundResponse({
    description:
      '❓ Not Found: The requested resource was not found. Please verify the provided parameters or URL.',
  })
  @ApiQuery({
    name: 'isSimpleQuery',
    example: 'false',
    required: false,
    type: 'boolean',
    description:
      'Specifies whether the query should be simple (without loading relations) or full (including relations).',
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<Church[]> {
    return this.churchService.findAll(paginationDto);
  }

  //* FIND BY TERM
  @Get(':term')
  @Auth()
  @ApiOkResponse({
    description:
      '✅ Successfully completed: The operation was completed successfully and the response contains the requested data.',
  })
  @ApiNotFoundResponse({
    description:
      '❓ Not Found: The requested resource was not found. Please verify the provided parameters or URL.',
  })
  @ApiParam({
    name: 'term',
    description:
      'Could be name church, date or range date, country, department, address, record status, etc.',
    example: 'Iglesia de Paz - Central',
  })
  @ApiQuery({
    name: 'searchType',
    enum: ChurchSearchType,
    description: 'Choose one of the types to perform a search.',
    example: ChurchSearchType.ChurchName,
  })
  findByTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchAndPaginationDto,
  ): Promise<Church[]> {
    return this.churchService.findByTerm(term, searchTypeAndPaginationDto);
  }

  //* UPDATE
  @Patch(':id')
  @Auth(UserRole.SuperUser, UserRole.AdminUser)
  @ApiOkResponse({
    description:
      '✅ Successfully completed: The resource was successfully updated. The updated data is returned in the response.',
  })
  @ApiNotFoundResponse({
    description:
      '❓ Not Found: The requested resource was not found. Please verify the provided parameters or URL.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Unique identifier of the church to be updated. This ID is used to find the existing record to apply the update.',
    example: 'f47c7d13-9d6a-4d9e-bd1e-2cb4b64c0a27',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChurchDto: UpdateChurchDto,
    @GetUser() user: User,
  ): Promise<Church> {
    return this.churchService.update(id, updateChurchDto, user);
  }

  //! INACTIVATE
  @Delete(':id')
  @Auth(UserRole.SuperUser)
  @ApiOkResponse({
    description:
      '✅ Successfully completed: The resource was successfully deleted. No content is returned.',
  })
  @ApiNotFoundResponse({
    description:
      '❓ Not Found: The requested resource was not found. Please verify the provided parameters or URL.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Unique identifier of the church to be inactivated. This ID is used to find the existing record to apply the inactivated.',
    example: 'f47c7d13-9d6a-4d9e-bd1e-2cb4b64c0a27',
  })
  remove(
    @Param('id') id: string,
    @Query() churchInactivationDto: InactivateChurchDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.churchService.remove(id, churchInactivationDto, user);
  }
}
