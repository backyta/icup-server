import { Response } from 'express';
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
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { diskStorage } from 'multer';

import { FileUploadDto } from '@/files/dtos';
import { FilesService } from '@/files/files.service';
import { fileFiler, fileNamer } from '@/files/helpers';

import { Auth } from '@/auth/decorators';
import { ValidUserRoles } from '@/auth/enums';

@ApiTags('Upload-Files')
@ApiBearerAuth()
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error, check logs.',
})
@ApiBadRequestResponse({
  description: 'Bad request.',
})
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  //* Find Offering File
  @Get('offering/:offeringFileName')
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  @ApiParam({
    name: 'offeringFileName',
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661.jpg',
  })
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiNotFoundResponse({
    description: 'Not found resource.',
  })
  findOfferingFile(
    @Res() res: Response,
    @Param('offeringFileName')
    offeringFileName: string,
  ): void {
    const path = this.filesService.getStaticOfferingFile(offeringFileName);

    res.sendFile(path);
  }

  //* Create record offering
  @Post('offering')
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  @ApiCreatedResponse({
    description: 'Offering file has been successfully uploaded.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFiler,
      limits: { fileSize: 1000000 },
      storage: diskStorage({
        destination: './uploads/offering-file',
        filename: fileNamer,
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Offering File',
    type: FileUploadDto,
  })
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

// TODO : hacer para cloudinary y guardar el url seguro en la entity de Upload, ver video de fernando y Yt
