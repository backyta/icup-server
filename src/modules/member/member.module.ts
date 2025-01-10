import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Member } from '@/modules/member/entities/member.entity';

import { AuthModule } from '@/modules/auth/auth.module';
import { MemberService } from '@/modules/member/member.service';
import { MemberController } from '@/modules/member/member.controller';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
  imports: [TypeOrmModule.forFeature([Member]), AuthModule],
  exports: [TypeOrmModule, MemberService],
})
export class MemberModule {}
