import { PartialType } from '@nestjs/swagger';
import { CreateFamilyHouseDto } from '@/family-house/dto';

export class UpdateFamilyHouseDto extends PartialType(CreateFamilyHouseDto) {}
