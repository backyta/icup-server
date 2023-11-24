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
import { PastorService } from './pastor.service';
import { CreatePastorDto } from './dto/create-pastor.dto';
import { UpdatePastorDto } from './dto/update-pastor.dto';
import { PaginationDto, SearchTypeAndPaginationDto } from '../common/dtos';

@Controller('pastor')
export class PastorController {
  constructor(private readonly pastorService: PastorService) {}

  @Post()
  create(@Body() createPastorDto: CreatePastorDto) {
    return this.pastorService.create(createPastorDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pastorService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.pastorService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePastorDto: UpdatePastorDto) {
    return this.pastorService.update(id, updatePastorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pastorService.remove(+id);
  }
}
