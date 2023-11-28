import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pastor } from './entities/pastor.entity';

import { PastorController } from './pastor.controller';
import { PastorService } from './pastor.service';

import { MembersModule } from '../members/members.module';
import { CopastorModule } from '../copastor/copastor.module';

@Module({
  controllers: [PastorController],
  providers: [PastorService],
  imports: [TypeOrmModule.forFeature([Pastor]), MembersModule, CopastorModule],
  exports: [TypeOrmModule, PastorService],
})
export class PastorModule {}
