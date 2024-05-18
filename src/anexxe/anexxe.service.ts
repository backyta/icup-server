import { Injectable } from '@nestjs/common';
import { CreateAnexxeDto } from './dto/create-anexxe.dto';
import { UpdateAnexxeDto } from './dto/update-anexxe.dto';

@Injectable()
export class AnexxeService {
  create(createAnexxeDto: CreateAnexxeDto) {
    return 'This action adds a new anexxe';
  }

  findAll() {
    return `This action returns all anexxe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} anexxe`;
  }

  update(id: number, updateAnexxeDto: UpdateAnexxeDto) {
    return `This action updates a #${id} anexxe`;
  }

  remove(id: number) {
    return `This action removes a #${id} anexxe`;
  }
}
