import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreacherService } from './preacher.service';
import { PreacherController } from './preacher.controller';
import { Preacher } from './entities/preacher.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastor/pastor.module';
import { CopastorModule } from '../copastor/copastor.module';
import { FamilyHomeModule } from '../family-home/family-home.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PreacherController],
  providers: [PreacherService],
  imports: [
    TypeOrmModule.forFeature([Preacher]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    FamilyHomeModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PreacherService],
})
export class PreacherModule {}
