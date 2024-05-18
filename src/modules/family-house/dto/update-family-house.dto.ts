import { PartialType } from '@nestjs/swagger';
import { CreateFamilyHouseDto } from '@/modules/family-house/dto';

export class UpdateFamilyHouseDto extends PartialType(CreateFamilyHouseDto) {}
