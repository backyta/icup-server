import { PartialType } from '@nestjs/swagger';
import { CreateSupervisorDto } from '@/modules/supervisor/dto/create-supervisor.dto';

export class UpdateSupervisorDto extends PartialType(CreateSupervisorDto) {}
