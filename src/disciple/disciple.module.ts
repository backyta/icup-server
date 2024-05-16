import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Disciple } from '@/disciple/entities';
import { DiscipleService } from '@/disciple/disciple.service';
import { DiscipleController } from '@/disciple/disciple.controller';

import { AuthModule } from '@/auth/auth.module';
import { PastorModule } from '@/pastor/pastor.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { PreacherModule } from '@/preacher/preacher.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

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
