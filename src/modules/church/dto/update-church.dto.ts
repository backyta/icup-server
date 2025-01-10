import { PartialType } from '@nestjs/swagger';
import { CreateChurchDto } from '@/modules/church/dto/create-church.dto';

export class UpdateChurchDto extends PartialType(CreateChurchDto) {}
