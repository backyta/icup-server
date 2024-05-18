import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  dataMembersPastor,
  dataMembersCopastor,
  dataMembersPreacher,
  dataFamilyHouses,
  dataMembers,
  dataOfferings,
  dataUsers,
} from '@/modules/seed/data';

import { User } from '@/modules/user/entities';
import { Disciple } from '@/modules/disciple/entities';
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { FamilyHouse } from '@/modules/family-house/entities';

import { AuthService } from '@/modules/auth/auth.service';
import { UserService } from '@/modules/user/user.service';
import { DiscipleService } from '@/modules/disciple/disciple.service';
import { OfferingService } from '@/modules/offering/offering.service';
import { FamilyHouseService } from '@/modules/family-house/family-house.service';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly coPastorRepository: Repository<Copastor>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyHouse)
    private readonly familyHouseRepository: Repository<FamilyHouse>,

    @InjectRepository(Disciple)
    private readonly memberRepository: Repository<Disciple>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly memberService: DiscipleService,
    private readonly familyHousesService: FamilyHouseService,
    private readonly offeringsService: OfferingService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async runSeed(): Promise<string> {
    await this.memberService.deleteAllMembers();
    await this.familyHousesService.deleteAllFamilyHouses();
    await this.offeringsService.deleteAllOfferings();
    await this.userService.deleteAllUsers();

    const superUser = await this.insertUsers();

    await this.insertNewMembers(superUser);

    return 'SEED EXECUTED';
  }

  private async insertUsers() {
    const seedUsers = dataUsers.users;
    const users = [];

    const superUser = await this.userRepository
      .createQueryBuilder('user')
      .where('ARRAY[:role]::text[] @> user.roles', { role: 'super-user' })
      .getOne();

    seedUsers.forEach((user) => {
      users.push(this.authService.register(user, superUser));
    });

    await Promise.all(users);
    return superUser;
  }

  private async insertNewMembers(user: User) {
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

    //! Create members & pastor
    membersPastor.forEach((member) => {
      insertPromisesPastor.push(this.memberService.create(member, user));
    });

    await Promise.all(insertPromisesPastor);

    //! Create members & copastor
    const allPastores = await this.pastorRepository.find();

    const pastorIndep = allPastores.find(
      (pastor) => pastor.discipleId.districtResidence === 'Independencia',
    );

    const pastorComas = allPastores.find(
      (pastor) => pastor.discipleId.districtResidence === 'Comas',
    );

    const pastorCarab = allPastores.find(
      (pastor) => pastor.discipleId.districtResidence === 'Carabayllo',
    );

    membersCopastor.forEach((member) => {
      if (member.districtResidence === 'Independencia') {
        member.theirPastorId = pastorIndep.id;
      }
      if (member.districtResidence === 'Comas') {
        member.theirPastorId = pastorComas.id;
      }
      if (member.districtResidence === 'Carabayllo') {
        member.theirPastorId = pastorCarab.id;
      }

      insertPromisesCopastor.push(this.memberService.create(member, user));
    });

    await Promise.all(insertPromisesCopastor);

    //! Create members & preacher
    const allCopastores = await this.coPastorRepository.find();

    //* Copastor by Zona (Independencia)
    const copastorIndepA = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Independencia' &&
        copastor.discipleId.firstName === 'Luz Mariella' &&
        copastor.discipleId.lastName === 'Salgado Huaman',
    );

    const copastorIndepB = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Independencia' &&
        copastor.discipleId.firstName === 'Maria Mercedes' &&
        copastor.discipleId.lastName === 'Quispe Ramirez',
    );

    const copastorIndepC = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Independencia' &&
        copastor.discipleId.firstName === 'Liliana Rosario' &&
        copastor.discipleId.lastName === 'Rivera Geranio',
    );

    //* Copastor by Zona (Comas)
    const copastorComasX = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Comas' &&
        copastor.discipleId.firstName === 'Melisa Eva' &&
        copastor.discipleId.lastName === 'Camarena Ventura',
    );

    const copastorComasZ = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Comas' &&
        copastor.discipleId.firstName === 'Dylan Caleb' &&
        copastor.discipleId.lastName === 'Gonzales Quispe',
    );

    //* Copastor by Zona (Carabayllo)
    const copastorCarabaylloR = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Carabayllo' &&
        copastor.discipleId.firstName === 'Alberto Julian' &&
        copastor.discipleId.lastName === 'Fuentes Fiestas',
    );

    const copastorCarabaylloQ = allCopastores.find(
      (copastor) =>
        copastor.discipleId.districtResidence === 'Carabayllo' &&
        copastor.discipleId.firstName === 'Marcelo Benito' &&
        copastor.discipleId.lastName === 'Palomares Garcia',
    );

    membersPreacher.forEach((member, index) => {
      if (member.districtResidence === 'Independencia') {
        if (index === 0) {
          member.theirCopastorId = copastorIndepA.id;
        }
        if (index === 1) {
          member.theirCopastorId = copastorIndepB.id;
        }
        if (index === 2) {
          member.theirCopastorId = copastorIndepC.id;
        }
      }

      if (member.districtResidence === 'Comas') {
        if (index === 3) {
          member.theirCopastorId = copastorComasX.id;
        }
        if (index === 4) {
          member.theirCopastorId = copastorComasZ.id;
        }
      }

      if (member.districtResidence === 'Carabayllo') {
        if (index === 5) {
          member.theirCopastorId = copastorCarabaylloR.id;
        }
        if (index === 6) {
          member.theirCopastorId = copastorCarabaylloQ.id;
        }
      }

      insertPromisesPreacher.push(this.memberService.create(member, user));
    });

    await Promise.all(insertPromisesPreacher);

    //! Create Family Home
    const allPreachers = await this.preacherRepository.find();

    //* Preacher by Zone (Independencia)
    const preachersIndepA = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Independencia' &&
        preacher.theirCopastorId.discipleId.firstName === 'Luz Mariella' &&
        preacher.theirCopastorId.discipleId.lastName === 'Salgado Huaman',
    );

    const preachersIndepB = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Independencia' &&
        preacher.theirCopastorId.discipleId.firstName === 'Maria Mercedes' &&
        preacher.theirCopastorId.discipleId.lastName === 'Quispe Ramirez',
    );

    const preachersIndepC = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Independencia' &&
        preacher.theirCopastorId.discipleId.firstName === 'Liliana Rosario' &&
        preacher.theirCopastorId.discipleId.lastName === 'Rivera Geranio',
    );

    //* Preacher by Zone (Comas)
    const preachersComasX = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Comas' &&
        preacher.theirCopastorId.discipleId.firstName === 'Melisa Eva' &&
        preacher.theirCopastorId.discipleId.lastName === 'Camarena Ventura',
    );

    const preachersComasZ = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Comas' &&
        preacher.theirCopastorId.discipleId.firstName === 'Dylan Caleb' &&
        preacher.theirCopastorId.discipleId.lastName === 'Gonzales Quispe',
    );

    //* Preacher by Zone (Carabayllo)
    const preachersCarabaylloR = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Carabayllo' &&
        preacher.theirCopastorId.discipleId.firstName === 'Alberto Julian' &&
        preacher.theirCopastorId.discipleId.lastName === 'Fuentes Fiestas',
    );

    const preachersCarabaylloQ = allPreachers.find(
      (preacher) =>
        preacher.discipleId.districtResidence === 'Carabayllo' &&
        preacher.theirCopastorId.discipleId.firstName === 'Marcelo Benito' &&
        preacher.theirCopastorId.discipleId.lastName === 'Palomares Garcia',
    );

    familyHouses.forEach((house, index) => {
      if (house.district === 'Independencia') {
        if (index === 0) {
          house.their_preacher = preachersIndepA.id;
        }

        if (index === 1) {
          house.their_preacher = preachersIndepB.id;
        }

        if (index === 2) {
          house.their_preacher = preachersIndepC.id;
        }
      }

      if (house.district === 'Comas') {
        if (index === 3) {
          house.their_preacher = preachersComasX.id;
        }

        if (index === 4) {
          house.their_preacher = preachersComasZ.id;
        }
      }

      if (house.district === 'Carabayllo') {
        if (index === 5) {
          house.their_preacher = preachersCarabaylloR.id;
        }

        if (index === 6) {
          house.their_preacher = preachersCarabaylloQ.id;
        }
      }

      insertPromisesFamilyHome.push(
        this.familyHousesService.create(house, user),
      );
    });

    await Promise.all(insertPromisesFamilyHome);

    //! Create Members
    const allFamilyHouses = await this.familyHouseRepository.find();

    //* FamilyHome by Zone (Independencia)
    const familyHomeA = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Independencia' &&
        familyHouse.houseZone === 'A',
    );

    const familyHomeB = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Independencia' &&
        familyHouse.houseZone === 'B',
    );

    const familyHomeC = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Independencia' &&
        familyHouse.houseZone === 'C',
    );

    //* FamilyHome by Zone (Comas)
    const familyHomeX = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Comas' && familyHouse.houseZone === 'X',
    );

    const familyHomeZ = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Comas' && familyHouse.houseZone === 'Z',
    );

    //* FamilyHome by Zone (Carabayllo)
    const familyHomeR = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Carabayllo' && familyHouse.houseZone === 'R',
    );

    const familyHomeQ = allFamilyHouses.find(
      (familyHouse) =>
        familyHouse.district === 'Carabayllo' && familyHouse.houseZone === 'Q',
    );

    members.forEach((member, index) => {
      if (member.districtResidence === 'Independencia') {
        if (index >= 0 && index <= 3) {
          member.theirFamilyHouseId = familyHomeA.id;
        }

        if (index >= 4 && index <= 6) {
          member.theirFamilyHouseId = familyHomeB.id;
        }

        if (index >= 7 && index <= 9) {
          member.theirFamilyHouseId = familyHomeC.id;
        }
      }

      if (member.districtResidence === 'Comas') {
        if (index >= 10 && index <= 13) {
          member.theirFamilyHouseId = familyHomeX.id;
        }

        if (index >= 14 && index <= 16) {
          member.theirFamilyHouseId = familyHomeZ.id;
        }
      }

      if (member.districtResidence === 'Carabayllo') {
        if (index >= 17 && index <= 20) {
          member.theirFamilyHouseId = familyHomeR.id;
        }

        if (index >= 20 && index <= 23) {
          member.theirFamilyHouseId = familyHomeQ.id;
        }
      }

      insertPromisesMembers.push(this.memberService.create(member, user));
    });

    await Promise.all(insertPromisesMembers);

    //! Create Offerings
    const allMembers = await this.memberRepository.find();

    //* Select one Copastor (Zonal Fasting)
    const copastor = allCopastores.find((copastor) => copastor);

    //* Select one FamilyHome (Offering Home)
    const familyHome = allFamilyHouses.find((familyHome) => familyHome);

    //* Select another Member (Tithe and Offering Special)
    const memberTithe = allMembers.find((member) => member);
    const memberOffering = allMembers.find((member) => member);

    offerings.forEach((offering, index) => {
      if (offering.type === 'tithe') {
        if (index === 0) {
          offering.member_id = memberTithe.id;
        }
      }

      if (offering.type === 'offering') {
        if (index === 1 && offering.sub_type === 'zonal_fasting') {
          offering.copastor_id = copastor.id;
        }

        if (index === 2 && offering.sub_type === 'family_home') {
          offering.family_home_id = familyHome.id;
        }

        if (index === 3 && offering.sub_type === 'special') {
          offering.member_id = memberOffering.id;
        }
      }

      insertPromisesOfferings.push(
        this.offeringsService.create(offering, user),
      );
    });

    await Promise.all(insertPromisesOfferings);

    return true;
  }
}
