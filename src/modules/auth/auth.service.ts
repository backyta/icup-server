/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Logger,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { RecordStatus } from '@/common/enums/record-status.enum';

import { User } from '@/modules/user/entities/user.entity';
import { LoginUserDto } from '@/modules/auth/dto/login-user.dto';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  //* Login user
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { password, email } = loginUserDto;

    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: {
          firstNames: true,
          lastNames: true,
          roles: true,
          recordStatus: true,
          email: true,
          gender: true,
          password: true,
          id: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException(
          `Credenciales invalidas, verifique el correo y la contraseña.`,
        );
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(
          `Credenciales invalidas, verifique el correo y la contraseña.`,
        );
      }

      if (user.recordStatus === RecordStatus.Inactive) {
        throw new UnauthorizedException(
          `Credenciales bloqueadas, este usuario no tiene acceso.`,
        );
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.handleDBExceptions(error);
    }
  }

  //* Check auth status (regenerate token)
  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  //? PRIVATE METHODS
  //* Sign token
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  // For future index errors or constrains with code.
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(`${error.message}`);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Sucedió un error inesperado, hable con el administrador.',
    );
  }
}
