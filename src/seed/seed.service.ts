import { Injectable } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { FamilyHomeService } from 'src/family-home/family-home.service';
import {
  dataMembersPastor,
  dataMembersCopastor,
  dataMembersPreacher,
  dataFamilyHouses,
} from './data/seed-data';
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
    //* Delete all data
    await this.memberService.deleteAllMembers();
    await this.familyHomeService.deleteAllFamilyHouses();

    const membersPastor = dataMembersPastor.members;
    const membersCopastor = dataMembersCopastor.members;
    const membersPreacher = dataMembersPreacher.members;
    const familyHouses = dataFamilyHouses.houses;

    const insertPromisesPastor = [];
    const insertPromisesCopastor = [];
    const insertPromisesPreacher = [];
    const insertPromisesFamilyHome = [];

    //* Create members & pastor
    membersPastor.forEach((member) => {
      insertPromisesPastor.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesPastor);

    //* Create members & copastor
    const allPastores = await this.pastorRepository.find();

    const pastorIndep = allPastores.find(
      (pastor) => pastor.member.district === 'Independencia',
    );

    const pastorComas = allPastores.find(
      (pastor) => pastor.member.district === 'Comas',
    );

    const pastorCarab = allPastores.find(
      (pastor) => pastor.member.district === 'Carabayllo',
    );

    membersCopastor.forEach((member) => {
      if (member.district === 'Independencia') {
        member.their_pastor = pastorIndep.id;
      }
      if (member.district === 'Comas') {
        member.their_pastor = pastorComas.id;
      }
      if (member.district === 'Carabayllo') {
        member.their_pastor = pastorCarab.id;
      }

      insertPromisesCopastor.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesCopastor);

    //* Create members & preacher
    const allCopastores = await this.coPastorRepository.find();

    //* Copastor by Zona (Independencia)
    const copastorIndepA = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Independencia' &&
        copastor.member.first_name === 'Luz Mariella' &&
        copastor.member.last_name === 'Salgado Huaman',
    );

    const copastorIndepB = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Independencia' &&
        copastor.member.first_name === 'Maria Mercedes' &&
        copastor.member.last_name === 'Quispe Ramirez',
    );

    const copastorIndepC = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Independencia' &&
        copastor.member.first_name === 'Liliana Rosario' &&
        copastor.member.last_name === 'Rivera Geranio',
    );

    //* Copastor by Zona (Comas)
    const copastorComasX = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Comas' &&
        copastor.member.first_name === 'Melisa Eva' &&
        copastor.member.last_name === 'Camarena Ventura',
    );

    const copastorComasZ = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Comas' &&
        copastor.member.first_name === 'Dylan Caleb' &&
        copastor.member.last_name === 'Gonzales Quispe',
    );

    //* Copastor by Zona (Carabayllo)
    const copastorCarabaylloR = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Carabayllo' &&
        copastor.member.first_name === 'Alberto Julian' &&
        copastor.member.last_name === 'Fuentes Fiestas',
    );

    const copastorCarabaylloQ = allCopastores.find(
      (copastor) =>
        copastor.member.district === 'Carabayllo' &&
        copastor.member.first_name === 'Marcelo Benito' &&
        copastor.member.last_name === 'Palomares Garcia',
    );

    membersPreacher.forEach((member, index) => {
      let countInd: number = index;
      let countCom: number = index;
      let countCar: number = index;

      countInd = member.district === 'Independencia' && countInd;
      countCom = member.district === 'Comas' && countCom - 10;
      countCar = member.district === 'Carabayllo' && countCar - 16;

      if (member.district === 'Independencia') {
        if (countInd >= 0 && countInd <= 3) {
          member.their_copastor = copastorIndepA.id;
        }
        if (countInd >= 4 && countInd <= 6) {
          member.their_copastor = copastorIndepB.id;
        }
        if (countInd >= 7 && countInd <= 9) {
          member.their_copastor = copastorIndepC.id;
        }
      }

      if (member.district === 'Comas') {
        if (countCom >= 0 && countCom <= 2) {
          member.their_copastor = copastorComasX.id;
        }
        if (countCom >= 3 && countCom <= 5) {
          member.their_copastor = copastorComasZ.id;
        }
      }

      if (member.district === 'Carabayllo') {
        if (countCar >= 0 && countCar <= 2) {
          member.their_copastor = copastorCarabaylloR.id;
        }
        if (countCar >= 3 && countCar <= 5) {
          member.their_copastor = copastorCarabaylloQ.id;
        }
      }

      insertPromisesPreacher.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesPreacher);

    //* Create Family Home
    const allPreachers = await this.preacherRepository.find();

    //* Preacher by Zone (Independencia)
    const preachersIndepA = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Luz Mariella' &&
        preacher.their_copastor.member.last_name === 'Salgado Huaman',
    );
    console.log(preachersIndepA);

    const preachersIndepB = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Maria Mercedes' &&
        preacher.their_copastor.member.last_name === 'Quispe Ramirez',
    );

    const preachersIndepC = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Liliana Rosario' &&
        preacher.their_copastor.member.last_name === 'Rivera Geranio',
    );

    //* Preacher by Zone (Comas)
    const preachersComasX = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Comas' &&
        preacher.their_copastor.member.first_name === 'Melisa Eva' &&
        preacher.their_copastor.member.last_name === 'Camarena Ventura',
    );

    const preachersComasZ = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Comas' &&
        preacher.their_copastor.member.first_name === 'Dylan Caleb' &&
        preacher.their_copastor.member.last_name === 'Gonzales Quispe',
    );

    //* Preacher by Zone (Carabayllo)

    const preachersCarabaylloR = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Carabayllo' &&
        preacher.their_copastor.member.first_name === 'Alberto Julian' &&
        preacher.their_copastor.member.last_name === 'Fuentes Fiestas',
    );

    const preachersCarabaylloQ = allPreachers.filter(
      (preacher) =>
        preacher.member.district === 'Carabayllo' &&
        preacher.their_copastor.member.first_name === 'Marcelo Benito' &&
        preacher.their_copastor.member.last_name === 'Palomares Garcia',
    );

    familyHouses.forEach((house, index) => {
      let countInd: number = index;
      let countCom: number = index;
      let countCar: number = index;

      countInd = house.district === 'Independencia' && countInd;
      countCom = house.district === 'Comas' && countCom - 10;
      countCar = house.district === 'Carabayllo' && countCar - 16;

      if (house.district === 'Independencia') {
        if (countInd === 0) {
          house.their_preacher = preachersIndepA[0].id;
        }
        if (countInd === 1) {
          house.their_preacher = preachersIndepA[1].id;
        }
        if (countInd === 2) {
          house.their_preacher = preachersIndepA[2].id;
        }
        if (countInd === 3) {
          house.their_preacher = preachersIndepA[3].id;
        }
        if (countInd === 4) {
          house.their_preacher = preachersIndepB[0].id;
        }
        if (countInd === 5) {
          house.their_preacher = preachersIndepB[1].id;
        }
        if (countInd === 6) {
          house.their_preacher = preachersIndepB[2].id;
        }
        if (countInd === 7) {
          house.their_preacher = preachersIndepC[0].id;
        }
        if (countInd === 8) {
          house.their_preacher = preachersIndepC[1].id;
        }
        if (countInd === 9) {
          house.their_preacher = preachersIndepC[2].id;
        }
      }

      if (house.district === 'Comas') {
        if (countCom === 0) {
          house.their_preacher = preachersComasX[0].id;
        }
        if (countCom === 1) {
          house.their_preacher = preachersComasX[1].id;
        }
        if (countCom === 2) {
          house.their_preacher = preachersComasX[2].id;
        }
        if (countCom === 3) {
          house.their_preacher = preachersComasZ[0].id;
        }
        if (countCom === 4) {
          house.their_preacher = preachersComasZ[1].id;
        }
        if (countCom === 5) {
          house.their_preacher = preachersComasZ[2].id;
        }
      }
      // TODO : corregir el error de que se repite el code.
      if (house.district === 'Carabayllo') {
        if (countCar === 0) {
          house.their_preacher = preachersCarabaylloR[0].id;
        }
        if (countCar === 1) {
          house.their_preacher = preachersCarabaylloR[1].id;
        }
        if (countCar === 2) {
          house.their_preacher = preachersCarabaylloR[2].id;
        }
        if (countCar === 3) {
          house.their_preacher = preachersCarabaylloQ[0].id;
        }
        if (countCar === 4) {
          house.their_preacher = preachersCarabaylloQ[1].id;
        }
        if (countCar === 5) {
          house.their_preacher = preachersCarabaylloQ[2].id;
        }
      }

      insertPromisesFamilyHome.push(this.familyHomeService.create(house));
    });

    await Promise.all(insertPromisesFamilyHome);
    //* Create Members

    //* Crear al member con rol pastor, esto crear automaticamente el registro en tabla Pastor.
    //* Crear a los members con rol copastor, esto crea automaticamente los registros en tabla Copastor.
    //* Crear a los members con rol preacher, esto crea automaticamente los registros en tabla Preacher.
    //* Crear Casas Familiares y asignarles sus predicadores.
    //* Crear todos los demas miembros, aletorios, tomando casa familiar con sus relaciones.

    return true;
  }
}
