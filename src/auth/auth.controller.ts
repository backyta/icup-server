import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

import { Auth } from './decorators';
import { GetUser } from './decorators/get-user.decorator';

import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto';
import { ValidUserRoles } from './enums/valid-user-roles.enum';
@ApiTags('Auth')
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth.',
})
@ApiBadRequestResponse({
  description: 'Bad request.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error, check logs.',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Create
  @ApiBearerAuth()
  @Post('register')
  @Auth(ValidUserRoles.superUser)
  @ApiCreatedResponse({
    description: 'User has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  registerUser(@Body() createUserDto: CreateUserDto, @GetUser() user: User) {
    return this.authService.register(createUserDto, user);
  }

  //* Login
  @Post('login')
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  //* Check Status
  @ApiBearerAuth()
  @Get('check-status')
  @Auth()
  @ApiOkResponse({
    description: 'Successful operation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
