import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

import { Auth } from './decorators';
import { GetUser } from './decorators/get-user.decorator';

import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto';
import { ValidUserRoles } from './enums/valid-user-roles.enum';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @Post('register')
  @Auth(ValidUserRoles.superUser)
  registerUser(@Body() createUserDto: CreateUserDto, @GetUser() user: User) {
    return this.authService.register(createUserDto, user);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @ApiBearerAuth()
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
