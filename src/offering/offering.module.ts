import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfferingService } from './offering.service';
import { OfferingController } from './offering.controller';
import { Offering } from './entities/offering.entity';

import { MembersModule } from '../members/members.module';
import { FamilyHomeModule } from '../family-home/family-home.module';
import { CopastorModule } from '../copastor/copastor.module';

@Module({
  controllers: [OfferingController],
  providers: [OfferingService],
  imports: [
    TypeOrmModule.forFeature([Offering]),
    MembersModule,
    FamilyHomeModule,
    CopastorModule,
  ],
  exports: [TypeOrmModule, OfferingService],
})
export class OfferingModule {}
