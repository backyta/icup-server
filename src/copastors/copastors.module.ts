import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CopastorsController } from './copastors.controller';
import { CoPastorsService } from './copastors.service';
import { CoPastor } from './entities/copastor.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastors/pastors.module';
import { PreacherModule } from '../preachers/preachers.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CopastorsController],
  providers: [CoPastorsService],
  imports: [
    TypeOrmModule.forFeature([CoPastor]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, CoPastorsService],
})
export class CopastorModule {}
