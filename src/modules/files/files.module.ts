import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';

import { FilesController } from '@/modules/files/files.controller';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule, AuthModule],
  controllers: [FilesController],
  providers: [],
})
export class FilesModule {}
