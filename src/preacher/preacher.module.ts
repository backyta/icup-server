import { Module, forwardRef } from '@nestjs/common';
import { PreacherService } from './preacher.service';
import { PreacherController } from './preacher.controller';
import { Preacher } from './entities/preacher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from 'src/members/members.module';
import { PastorModule } from 'src/pastor/pastor.module';
import { CopastorModule } from 'src/copastor/copastor.module';
import { FamilyHomeModule } from 'src/family-home/family-home.module';

@Module({
  controllers: [PreacherController],
  providers: [PreacherService],
  imports: [
    TypeOrmModule.forFeature([Preacher]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    FamilyHomeModule,
  ],
  exports: [TypeOrmModule, PreacherService],
})
export class PreacherModule {}
