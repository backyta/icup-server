import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamilyHouseService } from '@/family-house/family-house.service';
import { FamilyHouseController } from '@/family-house/family-house.controller';
import { FamilyHouse } from '@/family-house/entities';

import { AuthModule } from '@/auth/auth.module';
import { PastorModule } from '@/pastor/pastor.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { PreacherModule } from '@/preacher/preacher.module';

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
