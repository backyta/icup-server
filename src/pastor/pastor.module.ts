import { Module } from '@nestjs/common';
import { PastorService } from './pastor.service';
import { PastorController } from './pastor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pastor } from './entities/pastor.entity';
import { MembersModule } from 'src/members/members.module';
import { CopastorModule } from 'src/copastor/copastor.module';

@Module({
  controllers: [PastorController],
  providers: [PastorService],
  imports: [TypeOrmModule.forFeature([Pastor]), MembersModule, CopastorModule],
  exports: [TypeOrmModule, PastorService],
})
export class PastorModule {}
