import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyHouseDto } from './create-family-house.dto';

export class UpdateFamilyHouseDto extends PartialType(CreateFamilyHouseDto) {}
