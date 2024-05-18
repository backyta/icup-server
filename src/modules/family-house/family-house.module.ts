import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamilyHouseService } from '@/modules/family-house/family-house.service';
import { FamilyHouseController } from '@/modules/family-house/family-house.controller';
import { FamilyHouse } from '@/modules/family-house/entities';

import { AuthModule } from '@/modules/auth/auth.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';

@Module({
  controllers: [FamilyHouseController],
  providers: [FamilyHouseService],
  imports: [
    TypeOrmModule.forFeature([FamilyHouse]),
    forwardRef(() => DiscipleModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    forwardRef(() => PreacherModule),
    AuthModule,
  ],
  exports: [TypeOrmModule, FamilyHouseService],
})
export class FamilyHouseModule {}
