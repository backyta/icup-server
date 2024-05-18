import { Injectable } from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/modules/user/entities';
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { FamilyHouse } from '@/modules/family-house/entities';
import { Supervisor } from '@/modules/supervisor/entities';
import { Disciple } from '@/modules/disciple/entities';

@Injectable()
export class SupervisorService {
  constructor(
    @InjectRepository(Disciple)
    private readonly discipleRepository: Repository<Disciple>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly copastorRepository: Repository<Copastor>,

    @InjectRepository(Copastor)
    private readonly supervisorRepository: Repository<Supervisor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,
  ) {}

  create(createSupervisorDto: CreateSupervisorDto) {
    return 'This action adds a new supervisor';
  }

  findAll() {
    return `This action returns all supervisor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supervisor`;
  }

  update(id: number, updateSupervisorDto: UpdateSupervisorDto) {
    return `This action updates a #${id} supervisor`;
  }

  remove(id: number) {
    return `This action removes a #${id} supervisor`;
  }
}
