import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pastor } from '@/pastor/entities';
import { PastorService } from '@/pastor/pastor.service';
import { PastorController } from '@/pastor/pastor.controller';

import { AuthModule } from '@/auth/auth.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { PreacherModule } from '@/preacher/preacher.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

@Module({
  controllers: [PastorController],
  providers: [PastorService],
  imports: [
    TypeOrmModule.forFeature([Pastor]),
    forwardRef(() => DiscipleModule),
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PastorService],
})
export class PastorModule {}
