import { PartialType } from '@nestjs/swagger';
import { CreateExternalDonorDto } from '@/modules/external-donor/dto/create-external-donor.dto';

export class UpdateExternalDonorDto extends PartialType(
  CreateExternalDonorDto,
) {}
