import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/modules/user/entities';
import { UserService } from '@/modules/user/user.service';
import { UserController } from '@/modules/user/user.controller';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
