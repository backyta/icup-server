/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Logger,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {}

  //* Login user
  async login(loginUserDto: LoginUserDto, res: Response): Promise<any> {
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
          createdAt: false,
          updatedAt: false,
        },
      });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(
          'Credenciales inválidas, verifique su correo y contraseña.',
        );
      }

      if (user.recordStatus === RecordStatus.Inactive) {
        throw new UnauthorizedException(
          `Credenciales bloqueadas, este usuario no tiene acceso.`,
        );
      }

      const { password: _, ...userWithoutPassword } = user;

      const payload: JwtPayload = { id: user.id };
      //* Generate refresh token
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
        expiresIn: '1d',
      });

      const accessToken = this.getJwtToken(payload);

      //* Save Refresh Token in a Secure Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api/auth/',
        domain:
          this.configService.get('STAGE') === 'prod'
            ? `${this.configService.get('URL_DOMAIN')}`
            : 'localhost',
      });

      return res.json({
        ...userWithoutPassword,
        token: accessToken,
      });
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

  //* Refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      });
      return this.getJwtToken({ id: payload.id });
    } catch (error) {
      throw new UnauthorizedException(
        'El token es inválido o ha expirado. Por favor, inicia sesión nuevamente.',
      );
    }
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
