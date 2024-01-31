import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfferingsController } from './offerings.controller';
import { Offering } from './entities/offering.entity';

import { MembersModule } from '../members/members.module';
import { FamilyHouseModule } from '../family-houses/family-houses.module';
import { CopastorModule } from '../copastors/copastors.module';
import { AuthModule } from '../auth/auth.module';
import { OfferingsService } from './offerings.service';

@Module({
  controllers: [OfferingsController],
  providers: [OfferingsService],
  imports: [
    TypeOrmModule.forFeature([Offering]),
    MembersModule,
    FamilyHouseModule,
    CopastorModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, OfferingsService],
})
export class OfferingModule {}
