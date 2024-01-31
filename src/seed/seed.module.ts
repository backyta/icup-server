import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastors/pastors.module';
import { CopastorModule } from '../copastors/copastors.module';
import { PreacherModule } from '../preachers/preachers.module';
import { OfferingModule } from '../offerings/offerings.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    MembersModule,
    FamilyHouseModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    OfferingModule,
    AuthModule,
    UsersModule,
  ],
})
export class SeedModule {}
