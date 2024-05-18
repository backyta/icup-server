import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offering } from '@/modules/offering/entities';
import { OfferingService } from '@/modules/offering/offering.service';
import { OfferingController } from '@/modules/offering/offering.controller';

import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  controllers: [OfferingController],
  providers: [OfferingService],
  imports: [
    TypeOrmModule.forFeature([Offering]),
    DiscipleModule,
    FamilyHouseModule,
    CopastorModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, OfferingService],
})
export class OfferingModule {}
