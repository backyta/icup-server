import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@/auth/auth.module';

import { FilesService } from '@/files/files.service';
import { FilesController } from '@/files/files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [ConfigModule, AuthModule],
})
export class FilesModule {}
