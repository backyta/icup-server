import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedService } from '@/seed/seed.service';
import { SeedController } from '@/seed/seed.controller';

import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { PastorModule } from '@/pastor/pastor.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { PreacherModule } from '@/preacher/preacher.module';
import { OfferingModule } from '@/offering/offering.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

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
