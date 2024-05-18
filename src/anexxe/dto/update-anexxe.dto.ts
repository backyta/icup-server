import { PartialType } from '@nestjs/swagger';
import { CreateAnexxeDto } from './create-anexxe.dto';

export class UpdateAnexxeDto extends PartialType(CreateAnexxeDto) {}
