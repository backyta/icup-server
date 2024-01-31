import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreachersService } from './preachers.service';
import { PreachersController } from './preachers.controller';
import { Preacher } from './entities/preacher.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastors/pastors.module';
import { CopastorModule } from '../copastors/copastors.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PreachersController],
  providers: [PreachersService],
  imports: [
    TypeOrmModule.forFeature([Preacher]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PreachersService],
})
export class PreacherModule {}
