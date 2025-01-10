import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from '@/modules/member/dto/create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
