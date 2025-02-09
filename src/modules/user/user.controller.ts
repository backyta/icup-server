import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { PaginationDto } from '@/common/dtos/pagination.dto';
import { SearchAndPaginationDto } from '@/common/dtos/search-and-pagination.dto';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { InactivateUserDto } from '@/modules/user/dto/inactivate-user.dto';

import { User } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/user.service';
import { UserSearchType } from './enums/user-search-type.enum';

@ApiTags('Users')
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
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //* CREATE
  @ApiBearerAuth()
  @Post()
  @Auth(UserRole.SuperUser)
  @ApiCreatedResponse({
    description:
      '✅ Successfully created: The user has been successfully created and added to the system.',
  })
  registerUser(@Body() createUserDto: CreateUserDto, @GetUser() user: User) {
    return this.userService.create(createUserDto, user);
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
  findAll(@Query() paginationDto: PaginationDto): Promise<User[]> {
    return this.userService.findAll(paginationDto);
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
      'Could be first names, last names birth date, gender, country, department, address, record status, etc.',
    example: 'Rolando Martin',
  })
  @ApiQuery({
    name: 'searchType',
    enum: UserSearchType,
    description: 'Choose one of the types to perform a search.',
    example: UserSearchType.FirstNames,
  })
  findByTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchAndPaginationDto,
  ): Promise<User[]> {
    return this.userService.findByTerm(term, searchTypeAndPaginationDto);
  }

  //* UPDATE
  @Patch(':id')
  @Auth(UserRole.SuperUser)
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
      'Unique identifier of the user to be updated. This ID is used to find the existing record to apply the update.',
    example: 'f47c7d13-9d6a-4d9e-bd1e-2cb4b64c0a27',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto, user);
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
      'Unique identifier of the user to be inactivated. This ID is used to find the existing record to apply the inactivated.',
    example: 'f47c7d13-9d6a-4d9e-bd1e-2cb4b64c0a27',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() inactivateUserDto: InactivateUserDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.userService.delete(id, inactivateUserDto, user);
  }
}
