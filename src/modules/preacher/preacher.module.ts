import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Preacher } from '@/modules/preacher/entities';
import { PreacherService } from '@/modules/preacher/preacher.service';
import { PreacherController } from '@/modules/preacher/preacher.controller';

import { AuthModule } from '@/modules/auth/auth.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';

@Module({
  controllers: [PreacherController],
  providers: [PreacherService],
  imports: [
    TypeOrmModule.forFeature([Preacher]),
    forwardRef(() => DiscipleModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PreacherService],
})
export class PreacherModule {}
