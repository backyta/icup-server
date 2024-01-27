import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { OfferingService } from './offering.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { UpdateOfferingDto } from './dto/update-offering.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth, GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';

@Controller('offering')
export class OfferingController {
  constructor(private readonly offeringService: OfferingService) {}

  @Post()
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  create(@Body() createOfferingDto: CreateOfferingDto, @GetUser() user: User) {
    return this.offeringService.create(createOfferingDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.offeringService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.offeringService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfferingDto: UpdateOfferingDto,
    @GetUser() user: User,
  ) {
    return this.offeringService.update(id, updateOfferingDto, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.offeringService.remove(+id);
  // }
}
