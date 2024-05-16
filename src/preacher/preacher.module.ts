import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Preacher } from '@/preacher/entities';
import { PreacherService } from '@/preacher/preacher.service';
import { PreacherController } from '@/preacher/preacher.controller';

import { AuthModule } from '@/auth/auth.module';
import { PastorModule } from '@/pastor/pastor.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

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
