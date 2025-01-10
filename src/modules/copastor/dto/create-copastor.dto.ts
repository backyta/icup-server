import {
  IsEnum,
  IsArray,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Gender } from '@/common/enums/gender.enum';
import { MemberRole } from '@/common/enums/member-role.enum';
import { RecordStatus } from '@/common/enums/record-status.enum';
import { MaritalStatus } from '@/common/enums/marital-status.enum';
import { MemberInactivationReason } from '@/common/enums/member-inactivation-reason.enum';
import { MemberInactivationCategory } from '@/common/enums/member-inactivation-category.enum';

export class CreateCopastorDto {
  //* General and Personal info
  @ApiProperty({
    example: 'Marcos Arturo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  firstNames: string;

  @ApiProperty({
    example: 'Valdivia Fuerte',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  lastNames: string;

  @ApiProperty({
    example: Gender.Male,
  })
  @IsEnum(Gender, {
    message:
      'El género debe ser uno de los siguientes valores: Masculino o Femenino',
  })
  gender: string;

  @ApiProperty({
    example: MaritalStatus.Single,
  })
  @IsEnum(MaritalStatus, {
    message:
      'El estado civil debe ser uno de los siguientes valores: Soltero(a), Casado(a), Divorciado(a), Viudo(a), Otro.',
  })
  @IsNotEmpty()
  maritalStatus: string;

  @ApiProperty({
    example: 'Perú',
  })
  @IsString()
  @IsNotEmpty()
  originCountry: string;

  @ApiProperty({
    example: '1990/12/23',
  })
  @IsString()
  @IsNotEmpty()
  birthDate: Date;

  @ApiProperty({
    example: '2',
  })
  @IsOptional()
  numberChildren?: number | string;

  @ApiProperty({
    example: '2001/12/23',
  })
  @IsString()
  @IsOptional()
  conversionDate?: Date;

  //* Contact Info
  @ApiProperty({
    example: 'example@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+51 999333555',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Perú',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  residenceCountry?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  residenceDepartment?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  residenceProvince?: string;

  @ApiProperty({
    example: 'Comas',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  residenceDistrict: string;

  @ApiProperty({
    example: 'La Merced',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  residenceUrbanSector: string;

  @ApiProperty({
    example: 'Jr Pascana 123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(80)
  residenceAddress: string;

  @ApiProperty({
    example: 'A una cuadra del hospital central.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  referenceAddress: string;

  //* Roles and Status
  @ApiProperty({
    example: [MemberRole.Copastor],
  })
  @IsEnum(MemberRole, {
    each: true,
    message:
      'El valor debe ser un rol válido. Solo se permite el rol "Co-Pastor"',
  })
  @IsArray()
  @IsNotEmpty()
  roles: string[];

  @ApiProperty({
    example: RecordStatus.Active,
  })
  @IsString()
  @IsEnum(RecordStatus, {
    message:
      'El estado de registro debe ser uno de los siguientes valores: Activo o Inactivo',
  })
  @IsOptional()
  recordStatus?: string;

  //* Relations
  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsOptional()
  theirPastor?: string;

  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsOptional()
  theirChurch?: string;

  //! Properties record inactivation (optional)
  @ApiProperty({
    example: MemberInactivationCategory.PersonalChallenges,
    description: 'Member inactivation category.',
  })
  @IsOptional()
  @IsEnum(MemberInactivationCategory)
  memberInactivationCategory?: string;

  @ApiProperty({
    example: MemberInactivationReason.HealthIssues,
    description: 'Reason for member removal.',
  })
  @IsOptional()
  @IsEnum(MemberInactivationReason)
  memberInactivationReason?: string;
}
