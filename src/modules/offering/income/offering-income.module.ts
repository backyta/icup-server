import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';
import { OfferingIncomeService } from '@/modules/offering/income/offering-income.service';
import { OfferingIncomeController } from '@/modules/offering/income/offering-income.controller';

import { ZoneModule } from '@/modules/zone/zone.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ChurchModule } from '@/modules/church/church.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { SupervisorModule } from '@/modules/supervisor/supervisor.module';
import { FamilyGroupModule } from '@/modules/family-group/family-group.module';
import { ExternalDonorModule } from '@/modules/external-donor/external-donor.module';

@Module({
  controllers: [OfferingIncomeController],
  providers: [OfferingIncomeService],
  imports: [
    TypeOrmModule.forFeature([OfferingIncome]),
    forwardRef(() => DiscipleModule),
    forwardRef(() => ZoneModule),
    forwardRef(() => ChurchModule),
    forwardRef(() => PastorModule),
    forwardRef(() => PreacherModule),
    forwardRef(() => CopastorModule),
    forwardRef(() => SupervisorModule),
    forwardRef(() => FamilyGroupModule),
    AuthModule,
    ExternalDonorModule,
  ],
  exports: [TypeOrmModule, OfferingIncomeService],
})
export class OfferingIncomeModule {}
