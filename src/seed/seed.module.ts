import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastor/pastor.module';
import { CopastorModule } from '../copastor/copastor.module';
import { PreacherModule } from '../preacher/preacher.module';
import { OfferingModule } from '../offering/offering.module';
import { FamilyHomeModule } from '../family-home/family-home.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    MembersModule,
    FamilyHomeModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHomeModule,
    OfferingModule,
  ],
})
export class SeedModule {}
