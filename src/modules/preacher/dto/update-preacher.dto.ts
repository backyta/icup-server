import { PartialType } from '@nestjs/swagger';
import { CreatePreacherDto } from '@/modules/preacher/dto/create-preacher.dto';

export class UpdatePreacherDto extends PartialType(CreatePreacherDto) {}
