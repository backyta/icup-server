import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException(`Token not valid`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(`User is inactive, talk with an admin`);
    }

    return user;
  }
}

//* Cuando definimos constructor en el passport strategy, necesita llamar el constructor del padre.
//* Y definir la llave secreta y de donde se extrae el token
//* El resultado de la validacion se agrega como respuesta ala Request y sigue su flijo.

//! El JwtStrategy, o todas las strategies en general son Provider(comparten informacion a travez de toda la app)
//! Estos se deben declarar en el modle, como rpovider y se pueden exportar para usar en otros modules.

//* La soliciutd con el jwt siempre pasa por el strategy que es el guard(), donde se extrae ys e valida.
//* Es mejor usar el di para identificar a los usuarios en las rutas autenticadas, por el email es cambiante.

//? Lo que sale de aqui se pasa a la request, osea de aniade a la request y continua el flujo, y de la request
//? I can get out the user.
