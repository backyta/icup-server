import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { LoginUserDto } from '@/modules/auth/dto';
import { JwtPayload } from '@/modules/auth/interfaces';

import { CreateUserDto } from '@/modules/user/dto';
import { User } from '@/modules/user/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto, user: User) {
    const { password, ...userData } = createUserDto;

    try {
      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        created_by: user,
        created_at: new Date(),
      });

      await this.userRepository.save(newUser);
      delete newUser.password;
      return {
        ...newUser,
        token: this.getJetToken({ id: newUser.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Credential are not valid (email)`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Credential are not valid (password)`);
    }

    return {
      ...user,
      token: this.getJetToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJetToken({ id: user.id }),
    };
  }

  private getJetToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code == '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
