import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offering } from '@/offering/entities';
import { OfferingService } from '@/offering/offering.service';
import { OfferingController } from '@/offering/offering.controller';

import { DiscipleModule } from '@/disciple/disciple.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { AuthModule } from '@/auth/auth.module';

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
