import {
  Post,
  Query,
  Param,
  Delete,
  Controller,
  UploadedFiles,
  ParseFilePipe,
  UseInterceptors,
  FileTypeValidator,
  BadRequestException,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { UserRole } from '@/modules/auth/enums/user-role.enum';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

import { User } from '@/modules/user/entities/user.entity';

import { CreateFileDto } from '@/modules/files/dto/create-file.dto';
import { DeleteFileDto } from '@/modules/files/dto/delete-file.dto';

import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';

@Controller('files')
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
export class FilesController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  //* Upload file to cloudinary
  @Post('upload')
  @Auth(UserRole.SuperUser, UserRole.AdminUser, UserRole.TreasurerUser)
  @ApiCreatedResponse({
    description: 'Offering file has been successfully uploaded.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  async uploadImages(
    @Query() createFileDto: CreateFileDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    if (files.length > 4) {
      throw new BadRequestException('Image limits have been exceeded (max 4).');
    }

    const uploadedFilesPromises = files.map((file) =>
      this.cloudinaryService.uploadFile(file, createFileDto),
    );

    const result = await Promise.all(uploadedFilesPromises);

    const imageUrls = result.map((res) => res.secure_url);
    return { imageUrls };
  }

  //! Destroy file to cloudinary
  @Delete(':publicId')
  @Auth(UserRole.SuperUser, UserRole.AdminUser, UserRole.TreasurerUser)
  @ApiOkResponse({
    description: 'Successful operation.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  async deleteFile(
    @Param('publicId') publicId: string,
    @Query() deleteFileDto: DeleteFileDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.cloudinaryService.deleteFile(publicId, deleteFileDto, user);
  }
}
