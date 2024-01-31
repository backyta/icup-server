import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamilyHousesService } from './family-houses.service';
import { FamilyHousesController } from './family-houses.controller';
import { FamilyHouse } from './entities/family-house.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastors/pastors.module';
import { CopastorModule } from '../copastors/copastors.module';
import { PreacherModule } from '../preachers/preachers.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [FamilyHousesController],
  providers: [FamilyHousesService],
  imports: [
    TypeOrmModule.forFeature([FamilyHouse]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    forwardRef(() => PreacherModule),
    AuthModule,
  ],
  exports: [TypeOrmModule, FamilyHousesService],
})
export class FamilyHouseModule {}
