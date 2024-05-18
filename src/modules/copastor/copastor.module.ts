import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Copastor } from '@/modules/copastor/entities';
import { CoPastorService } from '@/modules/copastor/copastor.service';
import { CopastorController } from '@/modules/copastor/copastor.controller';

import { AuthModule } from '@/modules/auth/auth.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';

@Module({
  controllers: [CopastorController],
  providers: [CoPastorService],
  imports: [
    TypeOrmModule.forFeature([Copastor]),
    forwardRef(() => DiscipleModule),
    forwardRef(() => PastorModule),
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, CoPastorService],
})
export class CopastorModule {}
