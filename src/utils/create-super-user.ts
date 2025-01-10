import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '@/modules/user/entities/user.entity';

@Injectable()
export class SuperUserService {
  private readonly logger = new Logger('SuperUserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createSuperUser(): Promise<User> {
    const existingSuperUser = await this.userRepository
      .createQueryBuilder('user')
      .where('ARRAY[:role]::text[] @> user.roles', { role: 'super-user' })
      .getMany();

    if (existingSuperUser.length === 0) {
      const superUser = this.userRepository.create({
        email: this.configService.get('SUPER_USER_EMAIL'),
        password: bcrypt.hashSync(
          this.configService.get('SUPER_USER_PASSWORD'),
          10,
        ),
        firstNames: this.configService.get('SUPER_USER_FIRST_NAME'),
        lastNames: this.configService.get('SUPER_USER_LAST_NAME'),
        gender: 'male',
        roles: ['super-user'],
        createdAt: new Date(),
      });

      superUser.createdBy = superUser;

      this.logger.log('Super user created successfully.');
      return await this.userRepository.save(superUser);
    } else {
      this.logger.log('The Super User already exists.');
    }
  }
}
