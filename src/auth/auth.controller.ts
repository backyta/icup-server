import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Auth, RawHeaders, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './enums/valid-roles.enum';

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
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.adminUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.superUser)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}

//* Los Guards, son usados para permiti o previnir acceso a una rita. Aqui se autoiza una solicitud.

//! El Auth Guard  usa por defecto nuestra estrategia, de aqui viene todas las validaciones para entrear a esta
//! ruta, y si hay algun error lo manda, segun la estrategia configurada.

//* La metadata aniade data extra al metodo o controlador.

//* Para validar el SetMedaData, creamos un nuevo guard personalizado, y dependiendo del usuario y de los
//* roles que estan en la metada dejarlo pasar o no
