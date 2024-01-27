import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamilyHomeService } from './family-home.service';
import { FamilyHomeController } from './family-home.controller';
import { FamilyHome } from './entities/family-home.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastor/pastor.module';
import { CopastorModule } from '../copastor/copastor.module';
import { PreacherModule } from '../preacher/preacher.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [FamilyHomeController],
  providers: [FamilyHomeService],
  imports: [
    TypeOrmModule.forFeature([FamilyHome]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    forwardRef(() => PreacherModule),
    AuthModule,
  ],
  exports: [TypeOrmModule, FamilyHomeService],
})
export class FamilyHomeModule {}
