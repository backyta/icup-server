import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CoPastorService } from './copastor.service';

import { CreateCoPastorDto } from './dto/create-copastor.dto';
import { UpdateCoPastorDto } from './dto/update-copastor.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

@Controller('copastor')
export class CopastorController {
  constructor(private readonly coPastorService: CoPastorService) {}

  @Post()
  create(@Body() createCopastorDto: CreateCoPastorDto) {
    return this.coPastorService.create(createCopastorDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.coPastorService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.coPastorService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCoPastorDto: UpdateCoPastorDto,
  ) {
    return this.coPastorService.update(id, updateCoPastorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coPastorService.remove(id);
  }
}
