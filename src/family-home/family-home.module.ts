import { Module, forwardRef } from '@nestjs/common';
import { FamilyHomeService } from './family-home.service';
import { FamilyHomeController } from './family-home.controller';
import { FamilyHome } from './entities/family-home.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from 'src/members/members.module';
import { PastorModule } from 'src/pastor/pastor.module';
import { CopastorModule } from 'src/copastor/copastor.module';
import { PreacherModule } from 'src/preacher/preacher.module';

@Module({
  controllers: [FamilyHomeController],
  providers: [FamilyHomeService],
  imports: [
    TypeOrmModule.forFeature([FamilyHome]),
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    forwardRef(() => CopastorModule),
    forwardRef(() => PreacherModule),
  ],
  exports: [TypeOrmModule, FamilyHomeService],
})
export class FamilyHomeModule {}
