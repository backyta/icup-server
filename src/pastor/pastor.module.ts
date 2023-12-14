import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pastor } from './entities/pastor.entity';

import { PastorController } from './pastor.controller';
import { PastorService } from './pastor.service';

import { MembersModule } from '../members/members.module';
import { CopastorModule } from '../copastor/copastor.module';
import { PreacherModule } from 'src/preacher/preacher.module';
import { FamilyHomeModule } from 'src/family-home/family-home.module';

@Module({
  controllers: [PastorController],
  providers: [PastorService],
  imports: [
    TypeOrmModule.forFeature([Pastor]),
    forwardRef(() => MembersModule),
    CopastorModule,
    PreacherModule,
    FamilyHomeModule,
  ],
  exports: [TypeOrmModule, PastorService],
})
export class PastorModule {}
