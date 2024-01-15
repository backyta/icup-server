import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CopastorController } from './copastor.controller';
import { CoPastorService } from './copastor.service';
import { CoPastor } from './entities/copastor.entity';

import { MembersModule } from '../members/members.module';
import { PastorModule } from '../pastor/pastor.module';
import { PreacherModule } from '../preacher/preacher.module';
import { FamilyHomeModule } from '../family-home/family-home.module';

@Module({
  controllers: [CopastorController],
  providers: [CoPastorService],
  imports: [
    TypeOrmModule.forFeature([CoPastor]), // registra entidades para usar dentro del modulo(tabla que se guarda en DB).
    forwardRef(() => MembersModule),
    forwardRef(() => PastorModule),
    PreacherModule,
    FamilyHomeModule,
  ],
  exports: [TypeOrmModule, CoPastorService],
})
export class CopastorModule {}
