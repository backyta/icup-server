import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@/modules/auth/auth.module';

import { FilesService } from '@/modules/files/files.service';
import { FilesController } from '@/modules/files/files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [ConfigModule, AuthModule],
})
export class FilesModule {}
