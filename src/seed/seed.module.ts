import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { MembersModule } from 'src/members/members.module';
import { FamilyHomeModule } from 'src/family-home/family-home.module';
import { PastorModule } from 'src/pastor/pastor.module';
import { CopastorModule } from 'src/copastor/copastor.module';
import { PreacherModule } from 'src/preacher/preacher.module';
import { OfferingModule } from 'src/offering/offering.module';

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
