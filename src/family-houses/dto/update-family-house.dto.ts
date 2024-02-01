import { PartialType } from '@nestjs/swagger';
import { CreateFamilyHouseDto } from './create-family-house.dto';

export class UpdateFamilyHouseDto extends PartialType(CreateFamilyHouseDto) {}
