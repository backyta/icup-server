import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '@/modules/user/entities';

@Injectable()
export class SuperUserService {
  private readonly logger = new Logger('SuperUSerService');
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
        first_name: this.configService.get('SUPER_USER_FIRST_NAME'),
        last_name: this.configService.get('SUPER_USER_LAST_NAME'),
        roles: ['super-user'],
        created_at: new Date(),
      });

      superUser.created_by = superUser;

      this.logger.log('Super user created successfully.');
      return await this.userRepository.save(superUser);
    } else {
      this.logger.log('The Super User already exists.');
    }
  }
}
