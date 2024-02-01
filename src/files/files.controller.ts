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
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { FileUploadDto } from './dtos/file-upload.dto';
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

  // TODO : Ver video de producción de Fernando
  // TODO : Probar producción y evitar que impacte la DB
  // TODO : solucionar la carga de archivos (then)

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
