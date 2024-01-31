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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OfferingsService } from './offerings.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { UpdateOfferingDto } from './dto/update-offering.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

import { ValidUserRoles } from '../auth/enums/valid-user-roles.enum';
import { Auth, GetUser } from '../auth/decorators';

import { User } from '../users/entities/user.entity';
import { Offering } from './entities/offering.entity';

@ApiTags('Offerings')
@Controller('offerings')
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @ApiBearerAuth()
  @Post()
  @Auth(
    ValidUserRoles.superUser,
    ValidUserRoles.adminUser,
    ValidUserRoles.treasurerUser,
  )
  create(
    @Body() createOfferingDto: CreateOfferingDto,
    @GetUser() user: User,
  ): Promise<Offering> {
    return this.offeringsService.create(createOfferingDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<Offering[]> {
    return this.offeringsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ): Promise<Offering | Offering[]> {
    return this.offeringsService.findTerm(term, searchTypeAndPaginationDto);
  }

  @ApiBearerAuth()
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
  ): Promise<Offering> {
    return this.offeringsService.update(id, updateOfferingDto, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.offeringService.remove(+id);
  // }
}
