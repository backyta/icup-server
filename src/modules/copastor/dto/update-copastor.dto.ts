import { PartialType } from '@nestjs/swagger';
import { CreateCopastorDto } from '@/modules/copastor/dto/create-copastor.dto';

export class UpdateCopastorDto extends PartialType(CreateCopastorDto) {}
