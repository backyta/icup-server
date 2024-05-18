import { PartialType } from '@nestjs/swagger';

import { CreateOfferingDto } from '@/modules/offering/dto';

export class UpdateOfferingDto extends PartialType(CreateOfferingDto) {}
