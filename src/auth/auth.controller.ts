import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute() {
    return {
      ok: true,
      message: 'Hola Mundo Private',
    };
  }
}

//* Los Guards, son usados para permiti o previnir acceso a una rita. Aqui se autoiza una solicitud.

//! El Auth Guard  usa por defecto nuestra estrategia, de aqui viene todas las validaciones para entrear a esta
//! ruta, y si hay algun error lo manda, segun la estrategia configurada.
