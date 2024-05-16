import { PartialType } from '@nestjs/swagger';

import { CreateOfferingDto } from '@/offering/dto';

export class UpdateOfferingDto extends PartialType(CreateOfferingDto) {}
