import { PartialType } from '@nestjs/swagger';
import { CreateDiscipleDto } from '@/modules/disciple/dto';

export class UpdateDiscipleDto extends PartialType(CreateDiscipleDto) {}
