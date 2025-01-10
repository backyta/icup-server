import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { OfferingFileType } from '@/common/enums/offering-file-type.enum';

export class DeleteFileDto {
  @ApiProperty({
    example: 'my-folder/my-sub-folder/',
    description: 'Path required for image deletion.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  path: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/example/image/upload/v1239394512/cld-sample-4.jpg',
    description: 'Secure URL of the image hosted on Cloudinary',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  secureUrl: string;

  @ApiProperty({
    example: OfferingFileType.Expense,
    description: 'Type of file to be used for the image path.',
  })
  @IsEnum(OfferingFileType)
  @IsNotEmpty()
  @MinLength(1)
  fileType: string;
}
