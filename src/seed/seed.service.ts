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
} from './data/seed-data';

import { Member } from '../members/entities/member.entity';
import { Pastor } from '../pastor/entities/pastor.entity';
import { CoPastor } from '../copastor/entities/copastor.entity';
import { Preacher } from '../preacher/entities/preacher.entity';
import { FamilyHome } from '../family-home/entities/family-home.entity';
import { User } from '../users/entities/user.entity';

import { MembersService } from '../members/members.service';
import { OfferingService } from '../offering/offering.service';
import { FamilyHomeService } from '../family-home/family-home.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

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

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly memberService: MembersService,

    private readonly familyHomeService: FamilyHomeService,

    private readonly offeringService: OfferingService,

    private readonly userService: UsersService,

    private readonly authService: AuthService,
  ) {}

  async runSeed() {
    await this.memberService.deleteAllMembers();
    await this.familyHomeService.deleteAllFamilyHouses();
    await this.offeringService.deleteAllOfferings();
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

      insertPromisesCopastor.push(this.memberService.create(member, user));
    });

    await Promise.all(insertPromisesCopastor);

    //! Create members & preacher
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
      if (member.district === 'Independencia') {
        if (index === 0) {
          member.their_copastor = copastorIndepA.id;
        }
        if (index === 1) {
          member.their_copastor = copastorIndepB.id;
        }
        if (index === 2) {
          member.their_copastor = copastorIndepC.id;
        }
      }

      if (member.district === 'Comas') {
        if (index === 3) {
          member.their_copastor = copastorComasX.id;
        }
        if (index === 4) {
          member.their_copastor = copastorComasZ.id;
        }
      }

      if (member.district === 'Carabayllo') {
        if (index === 5) {
          member.their_copastor = copastorCarabaylloR.id;
        }
        if (index === 6) {
          member.their_copastor = copastorCarabaylloQ.id;
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

      insertPromisesFamilyHome.push(this.familyHomeService.create(house, user));
    });

    await Promise.all(insertPromisesFamilyHome);

    //! Create Members
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
      if (member.district === 'Independencia') {
        if (index >= 0 && index <= 3) {
          member.their_family_home = familyHomeA.id;
        }

        if (index >= 4 && index <= 6) {
          member.their_family_home = familyHomeB.id;
        }

        if (index >= 7 && index <= 9) {
          member.their_family_home = familyHomeC.id;
        }
      }

      if (member.district === 'Comas') {
        if (index >= 10 && index <= 13) {
          member.their_family_home = familyHomeX.id;
        }

        if (index >= 14 && index <= 16) {
          member.their_family_home = familyHomeZ.id;
        }
      }

      if (member.district === 'Carabayllo') {
        if (index >= 17 && index <= 20) {
          member.their_family_home = familyHomeR.id;
        }

        if (index >= 20 && index <= 23) {
          member.their_family_home = familyHomeQ.id;
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

    //* Select otwo Member (Tithe and Offering Special)
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

      insertPromisesOfferings.push(this.offeringService.create(offering, user));
    });

    await Promise.all(insertPromisesOfferings);

    return true;
  }
}
