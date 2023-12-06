import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyHomeDto } from './create-family-home.dto';

export class UpdateFamilyHomeDto extends PartialType(CreateFamilyHomeDto) {}
