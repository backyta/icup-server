import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { Auth, GetUser } from '../auth/decorators';
import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';

import { User } from '../users/entities/user.entity';
import { Member } from './entities/member.entity';

//TODO : finish document for every endpoint and DTO

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(ValidUserRoles.superUser)
  @ApiCreatedResponse({
    description: 'Member has been successfully created.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized Bearer Auth.',
  })
  create(
    @Body() createMemberDto: CreateMemberDto,
    @GetUser() user: User,
  ): Promise<Member> {
    return this.membersService.create(createMemberDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<Member[]> {
    return this.membersService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Member | Member[]> {
    return this.membersService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @GetUser() user: User,
  ): Promise<Member> {
    return this.membersService.update(id, updateMemberDto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Auth(ValidUserRoles.superUser, ValidUserRoles.adminUser)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.membersService.remove(id, user);
  }
}
