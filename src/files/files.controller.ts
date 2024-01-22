import {
  BadRequestException,
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

import { fileFiler, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('offering/:offeringName')
  findOfferingFile(
    @Res() res: Response,
    @Param('offeringName') offeringName: string,
  ) {
    const path = this.filesService.getStaticOfferingFile(offeringName);

    res.sendFile(path);
  }

  @Post('offering')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFiler,
      limits: { fileSize: 1000000 },
      storage: diskStorage({
        destination: './static/offerings',
        filename: fileNamer,
      }),
    }),
  )
  uploadOfferingFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(`Make sure the file is an image`);
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/offering/${
      file.filename
    }`;

    return { secureUrl };
  }
}
