import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pastor } from './entities/pastor.entity';

import { PastorsController } from './pastors.controller';
import { PastorsService } from './pastors.service';

import { MembersModule } from '../members/members.module';
import { CopastorModule } from '../copastors/copastors.module';
import { PreacherModule } from '../preachers/preachers.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PastorsController],
  providers: [PastorsService],
  imports: [
    TypeOrmModule.forFeature([Pastor]),
    forwardRef(() => MembersModule),
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PastorsService],
})
export class PastorModule {}
