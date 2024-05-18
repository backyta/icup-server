import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/user/dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
