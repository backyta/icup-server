import { PartialType } from '@nestjs/swagger';
import { CreateOfferingDto } from './create-offering.dto';

export class UpdateOfferingDto extends PartialType(CreateOfferingDto) {}
