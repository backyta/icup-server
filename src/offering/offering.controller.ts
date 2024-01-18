import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  // Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OfferingService } from './offering.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { UpdateOfferingDto } from './dto/update-offering.dto';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

@Controller('offering')
export class OfferingController {
  constructor(private readonly offeringService: OfferingService) {}

  @Post()
  create(@Body() createOfferingDto: CreateOfferingDto) {
    return this.offeringService.create(createOfferingDto);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfferingDto: UpdateOfferingDto,
  ) {
    return this.offeringService.update(id, updateOfferingDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.offeringService.remove(+id);
  // }
}
