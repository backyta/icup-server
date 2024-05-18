import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedService } from '@/modules/seed/seed.service';
import { SeedController } from '@/modules/seed/seed.controller';

import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';
import { OfferingModule } from '@/modules/offering/offering.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    DiscipleModule,
    FamilyHouseModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    OfferingModule,
    AuthModule,
    UserModule,
    ConfigModule,
  ],
})
export class SeedModule {}
