import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnexxeService } from './anexxe.service';
import { CreateAnexxeDto } from './dto/create-anexxe.dto';
import { UpdateAnexxeDto } from './dto/update-anexxe.dto';

@Controller('anexxe')
export class AnexxeController {
  constructor(private readonly anexxeService: AnexxeService) {}

  @Post()
  create(@Body() createAnexxeDto: CreateAnexxeDto) {
    return this.anexxeService.create(createAnexxeDto);
  }

  @Get()
  findAll() {
    return this.anexxeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anexxeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnexxeDto: UpdateAnexxeDto) {
    return this.anexxeService.update(+id, updateAnexxeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anexxeService.remove(+id);
  }
}
