import {
  IsArray,
  IsEmail,
  IsEnum,
  Matches,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Gender } from '@/common/enums/gender.enum';
import { RecordStatus } from '@/common/enums/record-status.enum';

import { UserInactivationReason } from '@/modules/user/enums/user-inactivation-reason.enum';
import { UserInactivationCategory } from '@/modules/user/enums/user-inactivation-category.enum';

import { UserRole } from '@/modules/auth/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'jorge.villena@icup.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Abcd$12345$',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    example: 'Jorge Martin',
  })
  @IsString()
  @MinLength(1)
  firstNames: string;

  @ApiProperty({
    example: 'Villena Sanchez',
  })
  @IsString()
  @MinLength(1)
  lastNames: string;

  @ApiProperty({
    example: Gender.Female,
  })
  @IsEnum(Gender, {
    message:
      'El género debe ser uno de los siguientes valores: Masculino o Femenino',
  })
  gender: string;

  @ApiProperty({
    example: RecordStatus.Active,
  })
  @IsString()
  @IsOptional()
  recordStatus?: string;

  @ApiProperty({
    example: [UserRole.SuperUser, UserRole.TreasurerUser],
  })
  @IsEnum(UserRole, {
    each: true,
    message:
      'Los roles pueden contener los siguientes valores: Super-Usuario, Usuario-Admin., Usuario-Tesor., Usuario.',
  })
  @IsArray()
  @IsNotEmpty()
  roles: string[];

  //! Properties record inactivation (optional)
  @ApiProperty({
    example: UserInactivationCategory.PerformanceOrConduct,
    description: 'Member inactivation category.',
  })
  @IsOptional()
  @IsEnum(UserInactivationCategory)
  userInactivationCategory?: string;

  @ApiProperty({
    example: UserInactivationReason.PolicyViolation,
    description: 'Reason for member removal.',
  })
  @IsOptional()
  @IsEnum(UserInactivationReason)
  userInactivationReason?: string;
}
