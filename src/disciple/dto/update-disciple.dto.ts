import { PartialType } from '@nestjs/swagger';

import { CreateDiscipleDto } from '@/disciple/dto';

export class UpdateDiscipleDto extends PartialType(CreateDiscipleDto) {}
