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

import { LoginUserDto } from '@/auth/dto';
import { ValidUserRoles } from '@/auth/enums';
import { AuthService } from '@/auth/auth.service';
import { Auth, GetUser } from '@/auth/decorators';

import { User } from '@/user/entities';
import { CreateUserDto } from '@/user/dto';
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

  //* Check is_active
  @ApiBearerAuth()
  @Get('check-is_active')
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
