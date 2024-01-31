import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';

import { PastorModule } from '../pastors/pastors.module';
import { CopastorModule } from '../copastors/copastors.module';
import { PreacherModule } from '../preachers/preachers.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  imports: [
    TypeOrmModule.forFeature([Member]),
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, MembersService],
})
export class MembersModule {}
