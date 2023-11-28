import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  imports: [TypeOrmModule.forFeature([Member])],
  exports: [TypeOrmModule, MembersService],
})
export class MembersModule {}
