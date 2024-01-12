import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferingDto } from './create-offering.dto';

export class UpdateOfferingDto extends PartialType(CreateOfferingDto) {}
