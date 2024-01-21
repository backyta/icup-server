import { Injectable } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { FamilyHomeService } from 'src/family-home/family-home.service';
import {
  dataMembersPastor,
  dataMembersCopastor,
  dataMembersPreacher,
  dataFamilyHouses,
  dataMembers,
  dataOfferings,
} from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import { Repository } from 'typeorm';
import { FamilyHome } from 'src/family-home/entities/family-home.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(CoPastor)
    private readonly coPastorRepository: Repository<CoPastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHome)
    private readonly familyHomeRepository: Repository<FamilyHome>,

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
    const members = dataMembers.members;
    const offerings = dataOfferings.offerings;

    const insertPromisesPastor = [];
    const insertPromisesCopastor = [];
    const insertPromisesPreacher = [];
    const insertPromisesFamilyHome = [];
    const insertPromisesMembers = [];
    const insertPromisesOfferings = [];

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
      countCom = member.district === 'Comas' && countCom - 3;
      countCar = member.district === 'Carabayllo' && countCar - 5;

      if (member.district === 'Independencia') {
        if (countInd === 0) {
          member.their_copastor = copastorIndepA.id;
        }
        if (countInd === 1) {
          member.their_copastor = copastorIndepB.id;
        }
        if (countInd === 2) {
          member.their_copastor = copastorIndepC.id;
        }
      }

      if (member.district === 'Comas') {
        if (countCom === 0) {
          member.their_copastor = copastorComasX.id;
        }
        if (countCom === 1) {
          member.their_copastor = copastorComasZ.id;
        }
      }

      if (member.district === 'Carabayllo') {
        if (countCar === 0) {
          member.their_copastor = copastorCarabaylloR.id;
        }
        if (countCar === 1) {
          member.their_copastor = copastorCarabaylloQ.id;
        }
      }

      insertPromisesPreacher.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesPreacher);

    //* Create Family Home
    const allPreachers = await this.preacherRepository.find();

    //* Preacher by Zone (Independencia)
    const preachersIndepA = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Luz Mariella' &&
        preacher.their_copastor.member.last_name === 'Salgado Huaman',
    );

    const preachersIndepB = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Maria Mercedes' &&
        preacher.their_copastor.member.last_name === 'Quispe Ramirez',
    );

    const preachersIndepC = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Independencia' &&
        preacher.their_copastor.member.first_name === 'Liliana Rosario' &&
        preacher.their_copastor.member.last_name === 'Rivera Geranio',
    );

    //* Preacher by Zone (Comas)
    const preachersComasX = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Comas' &&
        preacher.their_copastor.member.first_name === 'Melisa Eva' &&
        preacher.their_copastor.member.last_name === 'Camarena Ventura',
    );

    const preachersComasZ = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Comas' &&
        preacher.their_copastor.member.first_name === 'Dylan Caleb' &&
        preacher.their_copastor.member.last_name === 'Gonzales Quispe',
    );

    //* Preacher by Zone (Carabayllo)
    const preachersCarabaylloR = allPreachers.find(
      (preacher) =>
        preacher.member.district === 'Carabayllo' &&
        preacher.their_copastor.member.first_name === 'Alberto Julian' &&
        preacher.their_copastor.member.last_name === 'Fuentes Fiestas',
    );

    const preachersCarabaylloQ = allPreachers.find(
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
      countCom = house.district === 'Comas' && countCom - 3;
      countCar = house.district === 'Carabayllo' && countCar - 5;

      if (house.district === 'Independencia') {
        if (countInd === 0) {
          house.their_preacher = preachersIndepA.id;
        }

        if (countInd === 1) {
          house.their_preacher = preachersIndepB.id;
        }

        if (countInd === 2) {
          house.their_preacher = preachersIndepC.id;
        }
      }

      if (house.district === 'Comas') {
        if (countCom === 0) {
          house.their_preacher = preachersComasX.id;
        }

        if (countCom === 1) {
          house.their_preacher = preachersComasZ.id;
        }
      }

      if (house.district === 'Carabayllo') {
        if (countCar === 0) {
          house.their_preacher = preachersCarabaylloR.id;
        }

        if (countCar === 1) {
          house.their_preacher = preachersCarabaylloQ.id;
        }
      }

      insertPromisesFamilyHome.push(this.familyHomeService.create(house));
    });

    await Promise.all(insertPromisesFamilyHome);

    //* Create Members
    const allFamilyHouses = await this.familyHomeRepository.find();

    //* FamilyHome by Zone (Independencia)
    const familyHomeA = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Independencia' && familyhome.zone === 'A',
    );

    const familyHomeB = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Independencia' && familyhome.zone === 'B',
    );

    const familyHomeC = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Independencia' && familyhome.zone === 'C',
    );

    //* FamilyHome by Zone (Comas)
    const familyHomeX = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Comas' && familyhome.zone === 'X',
    );

    const familyHomeZ = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Comas' && familyhome.zone === 'Z',
    );

    //* FamilyHome by Zone (Carabayllo)
    const familyHomeR = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Carabayllo' && familyhome.zone === 'R',
    );

    const familyHomeQ = allFamilyHouses.find(
      (familyhome) =>
        familyhome.district === 'Carabayllo' && familyhome.zone === 'Q',
    );

    members.forEach((member, index) => {
      let countInd: number = index;
      let countCom: number = index;
      let countCar: number = index;

      countInd = member.district === 'Independencia' && countInd;
      countCom = member.district === 'Comas' && countCom - 10;
      countCar = member.district === 'Carabayllo' && countCar - 17;

      if (member.district === 'Independencia') {
        if (countInd >= 0 && countInd <= 3) {
          member.their_family_home = familyHomeA.id;
        }

        if (countInd >= 4 && countInd <= 6) {
          member.their_family_home = familyHomeB.id;
        }

        if (countInd >= 7 && countInd <= 9) {
          member.their_family_home = familyHomeC.id;
        }
      }

      if (member.district === 'Comas') {
        if (countCom >= 0 && countCom <= 3) {
          member.their_family_home = familyHomeX.id;
        }

        if (countCom >= 4 && countCom <= 6) {
          member.their_family_home = familyHomeZ.id;
        }
      }

      if (member.district === 'Carabayllo') {
        if (countCar >= 0 && countCar <= 3) {
          member.their_family_home = familyHomeR.id;
        }

        if (countCar >= 4 && countCar <= 6) {
          member.their_family_home = familyHomeQ.id;
        }
      }

      insertPromisesMembers.push(this.memberService.create(member));
    });

    await Promise.all(insertPromisesMembers);

    //* Crear al member con rol pastor, esto crear automaticamente el registro en tabla Pastor.
    //* Crear a los members con rol copastor, esto crea automaticamente los registros en tabla Copastor.
    //* Crear a los members con rol preacher, esto crea automaticamente los registros en tabla Preacher.
    //* Crear Casas Familiares y asignarles sus predicadores.
    //* Crear todos los demas miembros, aletorios, tomando casa familiar con sus relaciones.

    //* Crear registro de ofrendas
    //* Crear 1 registro de cada tipo con data aleatorio, de member (diezmo), member (especial ofrenda)
    //* sundayWorship, generalFasting, zonalFasting ( copastor), familyHome (familyHome), vigil.

    // const allMembers = await this.familyHomeRepository.find();
    // const allCopastores = await this.coPastorRepository.find();
    // const allFamilyHouses = await this.familyHomeRepository.find();

    //TODO : llenar registros y crear un registro para cada 1 segun especificacion.
    //TODO : empezar con modulo de autenticacion. (revisar notion)
    //* Select one Copastor (Zonal Fasting)
    const copastor = allCopastores.find((copastor) => copastor);

    //* Select one FamilyHome (Offering Home)
    const familyHome = allFamilyHouses.find((familyHome) => familyHome);

    //* Select otwo Member (Tithe and Offering Special)
    const memberTithe = allFamilyHouses.find((familyHome) => familyHome);
    const memberOffering = allFamilyHouses.find((familyHome) => familyHome);

    //! Colocar nota, que se debe agregar mas predicadores, mas casa, y mas miembros, estos son de muestra no mas.
    //* Para poder llenar levemente la DB

    return true;
  }
}
