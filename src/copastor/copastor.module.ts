import { Module, forwardRef } from '@nestjs/common';
import { CoPastorService } from './copastor.service';
import { CopastorController } from './copastor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoPastor } from './entities/copastor.entity';
import { MembersModule } from 'src/members/members.module';
import { PastorModule } from 'src/pastor/pastor.module';

@Module({
  controllers: [CopastorController],
  providers: [CoPastorService],
  imports: [
    TypeOrmModule.forFeature([CoPastor]),
    MembersModule,
    forwardRef(() => PastorModule),
  ],
  exports: [TypeOrmModule, CoPastorService],
})
export class CopastorModule {}
