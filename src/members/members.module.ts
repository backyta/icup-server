import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { PastorModule } from 'src/pastor/pastor.module';
import { CopastorModule } from 'src/copastor/copastor.module';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  imports: [TypeOrmModule.forFeature([Member]), PastorModule, CopastorModule],
  exports: [TypeOrmModule, MembersService],
})
export class MembersModule {}
