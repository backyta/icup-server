import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { PastorModule } from 'src/pastor/pastor.module';
import { CopastorModule } from 'src/copastor/copastor.module';
import { PreacherModule } from 'src/preacher/preacher.module';
import { FamilyHomeModule } from 'src/family-home/family-home.module';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  imports: [
    TypeOrmModule.forFeature([Member]),
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHomeModule,
  ],
  exports: [TypeOrmModule, MembersService],
})
export class MembersModule {}
