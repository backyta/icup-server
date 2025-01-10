import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

import { CreateUserDto } from '@/modules/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Abcd1234$',
    description: 'Current password.',
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The current password must have a Uppercase, lowercase letter and a number',
  })
  currentPassword?: string;

  @ApiProperty({
    example: 'Abcd1234$',
    description: 'Current password.',
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The new password must have a Uppercase, lowercase letter and a number',
  })
  newPassword?: string;
}
