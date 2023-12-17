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
import { PreacherService } from './preacher.service';
import { CreatePreacherDto } from './dto/create-preacher.dto';
import { UpdatePreacherDto } from './dto/update-preacher.dto';

import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

@Controller('preacher')
export class PreacherController {
  constructor(private readonly preacherService: PreacherService) {}

  @Post()
  create(@Body() createPreacherDto: CreatePreacherDto) {
    return this.preacherService.create(createPreacherDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.preacherService.findAll(paginationDto);
  }

  @Get(':term')
  findTerm(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.preacherService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePreacherDto: UpdatePreacherDto,
  ) {
    return this.preacherService.update(id, updatePreacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preacherService.remove(id);
  }
}
