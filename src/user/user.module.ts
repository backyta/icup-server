import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/user/entities';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';

import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
