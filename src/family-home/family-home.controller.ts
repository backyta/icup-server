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
import { FamilyHomeService } from './family-home.service';
import { CreateFamilyHomeDto } from './dto/create-family-home.dto';
import { UpdateFamilyHomeDto } from './dto/update-family-home.dto';
import { PaginationDto, SearchTypeAndPaginationDto } from 'src/common/dtos';

@Controller('family-home')
export class FamilyHomeController {
  constructor(private readonly familyHomeService: FamilyHomeService) {}

  @Post()
  create(@Body() createFamilyHomeDto: CreateFamilyHomeDto) {
    return this.familyHomeService.create(createFamilyHomeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.familyHomeService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query() searchTypeAndPaginationDto: SearchTypeAndPaginationDto,
  ) {
    return this.familyHomeService.findTerm(term, searchTypeAndPaginationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilyHomeDto: UpdateFamilyHomeDto,
  ) {
    return this.familyHomeService.update(id, updateFamilyHomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyHomeService.remove(id);
  }
}
