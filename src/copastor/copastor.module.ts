import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoPastor } from '@/copastor/entities';
import { CoPastorService } from '@/copastor/copastor.service';
import { CopastorController } from '@/copastor/copastor.controller';

import { AuthModule } from '@/auth/auth.module';
import { PastorModule } from '@/pastor/pastor.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { PreacherModule } from '@/preacher/preacher.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

@Module({
  controllers: [CopastorController],
  providers: [CoPastorService],
  imports: [
    TypeOrmModule.forFeature([CoPastor]),
    forwardRef(() => DiscipleModule),
    forwardRef(() => PastorModule),
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, CoPastorService],
})
export class CopastorModule {}
