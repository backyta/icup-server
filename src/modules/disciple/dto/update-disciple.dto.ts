import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscipleDto } from '@/modules/disciple/dto/create-disciple.dto';

export class UpdateDiscipleDto extends PartialType(CreateDiscipleDto) {}
