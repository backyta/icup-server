import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Disciple } from '@/modules/disciple/entities';
import { DiscipleService } from '@/modules/disciple/disciple.service';
import { DiscipleController } from '@/modules/disciple/disciple.controller';

import { AuthModule } from '@/modules/auth/auth.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';

@Module({
  controllers: [DiscipleController],
  providers: [DiscipleService],
  imports: [
    TypeOrmModule.forFeature([Disciple]),
    forwardRef(() => PastorModule),
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, DiscipleService],
})
export class DiscipleModule {}
