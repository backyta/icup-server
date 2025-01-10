import { PartialType } from '@nestjs/swagger';
import { CreatePastorDto } from '@/modules/pastor/dto/create-pastor.dto';

export class UpdatePastorDto extends PartialType(CreatePastorDto) {}
