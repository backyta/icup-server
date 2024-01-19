import { Injectable } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { FamilyHomeService } from 'src/family-home/family-home.service';
import { dataMembersPastor, dataMembersCopastor } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    private readonly memberService: MembersService,
    private readonly familyHomeService: FamilyHomeService,
  ) {}

  async runSeed() {
    await this.insertNewMembers();
    return 'SEED EXECUTED';
  }

  private async insertNewMembers() {
    await this.memberService.deleteAllMembers();
    await this.familyHomeService.deleteAllFamilyHouses();

    const membersPastor = dataMembersPastor.members;
    const membersCopastor = dataMembersCopastor.members;

    const insertPromisesPastor = [];
    const insertPromisesCopastor = [];

    membersPastor.forEach((member) => {
      insertPromisesPastor.push(this.memberService.create(member));
    });

    //TODO : continuar maniana y terminar semilla
    await Promise.all(insertPromisesPastor);
    const [pastor1, pastor2, pastor3] = await this.pastorRepository.find();
    // console.log(allPastores);

    membersCopastor.forEach((member, index) => {
      if (index <= 2) {
        member.their_pastor = pastor1.id;
      }
      if (index >= 3 && index <= 4) {
        member.their_pastor = pastor2.id;
      }
      if (index >= 5 && index <= 6) {
        member.their_pastor = pastor3.id;
      }

      insertPromisesCopastor.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesCopastor);

    //* Crear al member con rol pastor, esto crear automaticamente el registro en tabla Pastor.
    //* Crear a los members con rol copastor, esto crea automaticamente los registros en tabla Copastor.
    //* Crear a los members con rol preacher, esto crea automaticamente los registros en tabla Preacher.
    //* Crear Casas Familiares y asignarles sus predicadores.
    //* Crear todos los demas miembros, aletorios, tomando casa familiar con sus relaciones.

    return true;
  }
}
