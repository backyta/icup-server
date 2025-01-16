import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserService } from '@/modules/user/user.service';
import { ZoneService } from '@/modules/zone/zone.service';
import { ChurchService } from '@/modules/church/church.service';
import { PastorService } from '@/modules/pastor/pastor.service';
import { PreacherService } from '@/modules/preacher/preacher.service';
import { DiscipleService } from '@/modules/disciple/disciple.service';
import { CopastorService } from '@/modules/copastor/copastor.service';
import { SupervisorService } from '@/modules/supervisor/supervisor.service';
import { FamilyGroupService } from '@/modules/family-group/family-group.service';
import { OfferingIncomeService } from '@/modules/offering/income/offering-income.service';
import { OfferingExpenseService } from '@/modules/offering/expense/offering-expense.service';

import { Zone } from '@/modules/zone/entities/zone.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Member } from '@/modules/member/entities/member.entity';
import { Church } from '@/modules/church/entities/church.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';
import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

import { dataUsers } from '@/modules/seed/data/seed-users';
import { dataZones } from '@/modules/seed/data/seed-zone';
import { dataPastors } from '@/modules/seed/data/seed-pastors';
import { dataChurches } from '@/modules/seed/data/seed-churches';
import { dataDisciples } from '@/modules/seed/data/seed-disciples';
import { dataCopastors } from '@/modules/seed/data/seed-copastors';
import { dataPreachers } from '@/modules/seed/data/seed-preachers';
import { dataSupervisors } from '@/modules/seed/data/seed-supervisor';
import { dataFamilyGroups } from '@/modules/seed/data/seed-family-group';
import { dataOfferingIncome } from '@/modules/seed/data/seed-offering-income';
import { dataOfferingExpenses } from '@/modules/seed/data/seed-offering-expenses';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';
import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(Church)
    private readonly churchRepository: Repository<Church>,

    @InjectRepository(Pastor)
    private readonly pastorRepository: Repository<Pastor>,

    @InjectRepository(Copastor)
    private readonly copastorRepository: Repository<Copastor>,

    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,

    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,

    @InjectRepository(Preacher)
    private readonly preacherRepository: Repository<Preacher>,

    @InjectRepository(FamilyGroup)
    private readonly familyGroupRepository: Repository<FamilyGroup>,

    @InjectRepository(Disciple)
    private readonly discipleRepository: Repository<Disciple>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(OfferingIncome)
    private readonly offeringIncomeRepository: Repository<OfferingIncome>,

    @InjectRepository(OfferingExpense)
    private readonly offeringExpenseRepository: Repository<OfferingExpense>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly churchService: ChurchService,
    private readonly pastorService: PastorService,
    private readonly copastorService: CopastorService,
    private readonly supervisorService: SupervisorService,
    private readonly zoneService: ZoneService,
    private readonly preacherService: PreacherService,
    private readonly familyGroupService: FamilyGroupService,
    private readonly discipleService: DiscipleService,

    private readonly offeringIncomeService: OfferingIncomeService,
    private readonly offeringExpenseService: OfferingExpenseService,

    private readonly userService: UserService,
  ) {}

  async runSeed(): Promise<string> {
    const queryChurches = this.churchRepository.createQueryBuilder('churches');
    const queryMembers = this.memberRepository.createQueryBuilder('members');
    const queryPastors = this.pastorRepository.createQueryBuilder('pastors');
    const queryCopastor =
      this.copastorRepository.createQueryBuilder('copastors');
    const querySupervisors =
      this.supervisorRepository.createQueryBuilder('supervisors');
    const queryZones = this.zoneRepository.createQueryBuilder('zones');
    const queryPreachers =
      this.preacherRepository.createQueryBuilder('preachers');
    const queryFamilyGroups =
      this.familyGroupRepository.createQueryBuilder('family-houses');
    const queryDisciples =
      this.discipleRepository.createQueryBuilder('disciples');
    const queryUsers = this.userRepository.createQueryBuilder('users');

    const queryOfferingIncome =
      this.offeringIncomeRepository.createQueryBuilder('offeringIncome');
    const queryOfferingExpense =
      this.offeringExpenseRepository.createQueryBuilder('offeringExpense');

    try {
      await queryDisciples.delete().where({}).execute();
      await queryFamilyGroups.delete().where({}).execute();
      await queryPreachers.delete().where({}).execute();
      await querySupervisors.delete().where({}).execute();
      await queryZones.delete().where({}).execute();
      await queryCopastor.delete().where({}).execute();
      await queryPastors.delete().where({}).execute();
      await queryChurches.delete().where({}).execute();
      await queryMembers.delete().where({}).execute();

      await queryOfferingIncome.delete().where({}).execute();
      await queryOfferingExpense.delete().where({}).execute();

      await queryUsers
        .delete()
        .where('NOT (:role = ANY(roles))', { role: 'super-user' }) // delete user without super user role
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }

    const superUser = await this.insertUsers();

    await this.insertNewMembers(superUser);

    await this.insertNewOfferingIncome(superUser);
    await this.insertNewOfferingExpenses(superUser);

    return 'SEED EXECUTED';
  }

  //* Insert Users
  private async insertUsers() {
    const seedUsers = dataUsers.users;
    const users = [];

    const superUser = await this.userRepository
      .createQueryBuilder('user')
      .where('ARRAY[:role]::text[] @> user.roles', { role: 'super-user' })
      .getOne();

    seedUsers.forEach((user) => {
      users.push(this.userService.create(user, superUser));
    });

    await Promise.all(users);
    return superUser;
  }

  //* Insert Membership Data
  private async insertNewMembers(user: User) {
    const church = dataChurches.mainChurch;
    const anexes = dataChurches.anexes;
    const pastors = dataPastors.pastors;
    const copastors = dataCopastors.copastors;
    const supervisors = dataSupervisors.supervisors;
    const zones = dataZones.zones;
    const preachers = dataPreachers.preachers;
    const familyGroups = dataFamilyGroups.houses;
    const disciples = dataDisciples.disciples;

    const promisesAnexes = [];
    const promisesPastor = [];
    const promisesCopastor = [];
    const promisesSupervisor = [];
    const promisesZone = [];
    const promisesPreacher = [];
    const promisesDisciple = [];

    //? Create Main Church
    await this.churchService.create(church[0], user);

    const mainChurch = await this.churchRepository.findOne({
      where: { isAnexe: false },
      relations: ['anexes', 'theirMainChurch'],
    });

    //? Create Anexes
    anexes.forEach((anexe) => {
      anexe.theirMainChurch = mainChurch?.id;

      promisesAnexes.push(this.churchService.create(anexe, user));
    });

    await Promise.all(promisesAnexes);

    const firstAnexe = await this.churchRepository.findOne({
      where: { abbreviatedChurchName: 'ICUP - Nueva Esperanza', isAnexe: true },
      relations: ['theirMainChurch'],
    });

    const secondAnexe = await this.churchRepository.findOne({
      where: { abbreviatedChurchName: 'ICUP - Roca Fuerte', isAnexe: true },
      relations: ['theirMainChurch'],
    });

    //? Create Pastor
    pastors.forEach((pastor, index) => {
      index === 0
        ? (pastor.theirChurch = firstAnexe?.id)
        : index === 1
          ? (pastor.theirChurch = mainChurch?.id)
          : (pastor.theirChurch = secondAnexe?.id);

      promisesPastor.push(this.pastorService.create(pastor, user));
    });

    await Promise.all(promisesPastor);

    //? Create Copastor
    const pastor = await this.pastorRepository.find({
      order: {
        member: {
          residenceDistrict: 'ASC',
        },
      },
    });

    copastors.forEach((copastor, index) => {
      index >= 0 && index <= 2
        ? (copastor.theirPastor = pastor[0]?.id)
        : index >= 3 && index <= 5
          ? (copastor.theirPastor = pastor[1]?.id)
          : (copastor.theirPastor = pastor[2]?.id);

      promisesCopastor.push(this.copastorService.create(copastor, user));
    });

    await Promise.all(promisesCopastor);

    //? Create Supervisor
    const copastor = await this.copastorRepository.find({
      order: {
        member: {
          residenceDistrict: 'ASC',
        },
      },
    });

    supervisors.forEach((supervisor, index) => {
      //* Comas
      index >= 0 && index <= 1
        ? (supervisor.theirCopastor = copastor[0]?.id)
        : index >= 2 && index <= 3
          ? (supervisor.theirCopastor = copastor[1]?.id)
          : index >= 4 && index <= 5
            ? (supervisor.theirCopastor = copastor[2]?.id)
            : //* Independencia
              index >= 6 && index <= 7
              ? (supervisor.theirCopastor = copastor[3]?.id)
              : index >= 8 && index <= 9
                ? (supervisor.theirCopastor = copastor[4]?.id)
                : index >= 10 && index <= 11
                  ? (supervisor.theirCopastor = copastor[5]?.id)
                  : //* Los Olivos
                    index >= 12 && index <= 13
                    ? (supervisor.theirCopastor = copastor[6]?.id)
                    : index >= 14 && index <= 15
                      ? (supervisor.theirCopastor = copastor[7]?.id)
                      : (supervisor.theirCopastor = copastor[8]?.id);

      promisesSupervisor.push(this.supervisorService.create(supervisor, user));
    });

    await Promise.all(promisesSupervisor);

    //? Create Zones
    const allSupervisors = await this.supervisorRepository.find({
      order: {
        member: {
          residenceDistrict: 'ASC',
        },
      },
    });

    zones.forEach((zone, index) => {
      zone.theirSupervisor = allSupervisors[index]?.id;
      promisesZone.push(this.zoneService.create(zone, user));
    });

    await Promise.all(promisesZone);

    //? Create Preachers
    preachers.forEach((preacher, index) => {
      //* Comas
      index >= 0 && index <= 2
        ? (preacher.theirSupervisor = allSupervisors[0]?.id) // 3
        : index >= 3 && index <= 5
          ? (preacher.theirSupervisor = allSupervisors[1]?.id) // 3
          : index >= 6 && index <= 9
            ? (preacher.theirSupervisor = allSupervisors[2]?.id) // 4
            : index >= 10 && index <= 13
              ? (preacher.theirSupervisor = allSupervisors[3]?.id) // 4
              : index >= 14 && index <= 17
                ? (preacher.theirSupervisor = allSupervisors[4]?.id) // 4
                : index >= 18 && index <= 19
                  ? (preacher.theirSupervisor = allSupervisors[5]?.id) // 2
                  : //* Independencia
                    index >= 20 && index <= 22
                    ? (preacher.theirSupervisor = allSupervisors[6]?.id) // 3
                    : index >= 23 && index <= 25
                      ? (preacher.theirSupervisor = allSupervisors[7]?.id) // 3
                      : index >= 26 && index <= 29
                        ? (preacher.theirSupervisor = allSupervisors[8]?.id) // 4
                        : index >= 30 && index <= 33
                          ? (preacher.theirSupervisor = allSupervisors[9]?.id) // 4
                          : index >= 34 && index <= 37
                            ? (preacher.theirSupervisor =
                                allSupervisors[10]?.id) // 4
                            : index >= 38 && index <= 39
                              ? (preacher.theirSupervisor =
                                  allSupervisors[11]?.id) // 2
                              : //* Los Olivos
                                index >= 40 && index <= 42
                                ? (preacher.theirSupervisor =
                                    allSupervisors[12]?.id) // 3
                                : index >= 43 && index <= 45
                                  ? (preacher.theirSupervisor =
                                      allSupervisors[13]?.id) // 3
                                  : index >= 46 && index <= 49
                                    ? (preacher.theirSupervisor =
                                        allSupervisors[14]?.id) // 4
                                    : index >= 50 && index <= 53
                                      ? (preacher.theirSupervisor =
                                          allSupervisors[15]?.id) // 4
                                      : index >= 54 && index <= 57
                                        ? (preacher.theirSupervisor =
                                            allSupervisors[16]?.id) // 4
                                        : (preacher.theirSupervisor =
                                            allSupervisors[17]?.id); // 2

      promisesPreacher.push(this.preacherService.create(preacher, user));
    });

    await Promise.all(promisesPreacher);

    //? Create Family Houses
    const allPreachers = await this.preacherRepository.find({
      order: {
        member: {
          residenceDistrict: 'ASC',
        },
      },
    });

    async function crateHousesSorted(
      familyGroups,
      allPreachers,
      user,
      familyGroupService,
    ) {
      const promisesCreation = [];

      for (const [index, familyGroup] of familyGroups.entries()) {
        familyGroup.theirPreacher = allPreachers[index]?.id;

        try {
          const createdHouse = await familyGroupService.create(
            familyGroup,
            user,
          );
          promisesCreation.push(createdHouse);
        } catch (error) {
          console.error('Error al crear la casa:', error);
        }
      }

      return promisesCreation;
    }

    await crateHousesSorted(
      familyGroups,
      allPreachers,
      user,
      this.familyGroupService,
    );

    //? Create Disciples
    const allFamilyGroups = await this.familyGroupRepository.find({
      order: {
        district: 'ASC',
      },
    });

    disciples.forEach((disciple, index) => {
      //* Comas (134 disciples)
      index >= 0 && index <= 4
        ? (disciple.theirFamilyGroup = allFamilyGroups[0]?.id) // 5
        : index >= 5 && index <= 11
          ? (disciple.theirFamilyGroup = allFamilyGroups[1]?.id) // 7
          : index >= 12 && index <= 17
            ? (disciple.theirFamilyGroup = allFamilyGroups[2]?.id) // 6
            : index >= 18 && index <= 22
              ? (disciple.theirFamilyGroup = allFamilyGroups[3]?.id) // 5
              : index >= 23 && index <= 30
                ? (disciple.theirFamilyGroup = allFamilyGroups[4]?.id) // 8
                : index >= 31 && index <= 34
                  ? (disciple.theirFamilyGroup = allFamilyGroups[5]?.id) // 4
                  : index >= 35 && index <= 39
                    ? (disciple.theirFamilyGroup = allFamilyGroups[6]?.id) // 5
                    : index >= 40 && index <= 46
                      ? (disciple.theirFamilyGroup = allFamilyGroups[7]?.id) // 7
                      : index >= 47 && index <= 56
                        ? (disciple.theirFamilyGroup = allFamilyGroups[8]?.id) // 10
                        : index >= 57 && index <= 64
                          ? (disciple.theirFamilyGroup = allFamilyGroups[9]?.id) // 8
                          : index >= 65 && index <= 71
                            ? (disciple.theirFamilyGroup =
                                allFamilyGroups[10]?.id) // 7
                            : index >= 72 && index <= 81
                              ? (disciple.theirFamilyGroup =
                                  allFamilyGroups[11]?.id) // 10
                              : index >= 82 && index <= 87
                                ? (disciple.theirFamilyGroup =
                                    allFamilyGroups[12]?.id) // 6
                                : index >= 88 && index <= 92
                                  ? (disciple.theirFamilyGroup =
                                      allFamilyGroups[13]?.id) // 5
                                  : index >= 93 && index <= 98
                                    ? (disciple.theirFamilyGroup =
                                        allFamilyGroups[14]?.id) // 6
                                    : index >= 99 && index <= 102
                                      ? (disciple.theirFamilyGroup =
                                          allFamilyGroups[15]?.id) // 4
                                      : index >= 103 && index <= 110
                                        ? (disciple.theirFamilyGroup =
                                            allFamilyGroups[16]?.id) // 8
                                        : index >= 111 && index <= 119
                                          ? (disciple.theirFamilyGroup =
                                              allFamilyGroups[17]?.id) // 9
                                          : index >= 120 && index <= 128
                                            ? (disciple.theirFamilyGroup =
                                                allFamilyGroups[18]?.id) // 9
                                            : index >= 129 && index <= 133
                                              ? (disciple.theirFamilyGroup =
                                                  allFamilyGroups[19]?.id) // 5
                                              : //* Independencia (123 disciples)
                                                index >= 134 && index <= 138
                                                ? (disciple.theirFamilyGroup =
                                                    allFamilyGroups[20]?.id) // 5
                                                : index >= 139 && index <= 146
                                                  ? (disciple.theirFamilyGroup =
                                                      allFamilyGroups[21]?.id) // 8
                                                  : index >= 147 && index <= 155
                                                    ? (disciple.theirFamilyGroup =
                                                        allFamilyGroups[22]?.id) // 9
                                                    : index >= 156 &&
                                                        index <= 159
                                                      ? (disciple.theirFamilyGroup =
                                                          allFamilyGroups[23]?.id) // 4
                                                      : index >= 160 &&
                                                          index <= 162
                                                        ? (disciple.theirFamilyGroup =
                                                            allFamilyGroups[24]?.id) // 3
                                                        : index >= 163 &&
                                                            index <= 169
                                                          ? (disciple.theirFamilyGroup =
                                                              allFamilyGroups[25]?.id) // 7
                                                          : index >= 170 &&
                                                              index <= 175
                                                            ? (disciple.theirFamilyGroup =
                                                                allFamilyGroups[26]?.id) // 6
                                                            : index >= 176 &&
                                                                index <= 179
                                                              ? (disciple.theirFamilyGroup =
                                                                  allFamilyGroups[27]?.id) // 4
                                                              : index >= 180 &&
                                                                  index <= 184
                                                                ? (disciple.theirFamilyGroup =
                                                                    allFamilyGroups[28]?.id) // 5
                                                                : index >=
                                                                      185 &&
                                                                    index <= 189
                                                                  ? (disciple.theirFamilyGroup =
                                                                      allFamilyGroups[29]?.id) // 5
                                                                  : index >=
                                                                        190 &&
                                                                      index <=
                                                                        197
                                                                    ? (disciple.theirFamilyGroup =
                                                                        allFamilyGroups[30]?.id) // 8
                                                                    : index >=
                                                                          198 &&
                                                                        index <=
                                                                          203
                                                                      ? (disciple.theirFamilyGroup =
                                                                          allFamilyGroups[31]?.id) // 6
                                                                      : index >=
                                                                            204 &&
                                                                          index <=
                                                                            208
                                                                        ? (disciple.theirFamilyGroup =
                                                                            allFamilyGroups[32]?.id) // 5
                                                                        : index >=
                                                                              209 &&
                                                                            index <=
                                                                              217
                                                                          ? (disciple.theirFamilyGroup =
                                                                              allFamilyGroups[33]?.id) // 9
                                                                          : index >=
                                                                                218 &&
                                                                              index <=
                                                                                224
                                                                            ? (disciple.theirFamilyGroup =
                                                                                allFamilyGroups[34]?.id) // 7
                                                                            : index >=
                                                                                  225 &&
                                                                                index <=
                                                                                  234
                                                                              ? (disciple.theirFamilyGroup =
                                                                                  allFamilyGroups[35]?.id) // 10
                                                                              : index >=
                                                                                    235 &&
                                                                                  index <=
                                                                                    239
                                                                                ? (disciple.theirFamilyGroup =
                                                                                    allFamilyGroups[36]?.id) // 5
                                                                                : index >=
                                                                                      240 &&
                                                                                    index <=
                                                                                      245
                                                                                  ? (disciple.theirFamilyGroup =
                                                                                      allFamilyGroups[37]?.id) // 6
                                                                                  : index >=
                                                                                        246 &&
                                                                                      index <=
                                                                                        250
                                                                                    ? (disciple.theirFamilyGroup =
                                                                                        allFamilyGroups[38]?.id) // 5
                                                                                    : index >=
                                                                                          251 &&
                                                                                        index <=
                                                                                          256
                                                                                      ? (disciple.theirFamilyGroup =
                                                                                          allFamilyGroups[39]?.id) // 6
                                                                                      : //* Los Olivos (121 disciples)
                                                                                        index >=
                                                                                            257 &&
                                                                                          index <=
                                                                                            261
                                                                                        ? (disciple.theirFamilyGroup =
                                                                                            allFamilyGroups[40]?.id) // 5
                                                                                        : index >=
                                                                                              262 &&
                                                                                            index <=
                                                                                              269
                                                                                          ? (disciple.theirFamilyGroup =
                                                                                              allFamilyGroups[41]?.id) // 8
                                                                                          : index >=
                                                                                                270 &&
                                                                                              index <=
                                                                                                278
                                                                                            ? (disciple.theirFamilyGroup =
                                                                                                allFamilyGroups[42]?.id) // 9
                                                                                            : index >=
                                                                                                  279 &&
                                                                                                index <=
                                                                                                  282
                                                                                              ? (disciple.theirFamilyGroup =
                                                                                                  allFamilyGroups[43]?.id) // 4
                                                                                              : index >=
                                                                                                    283 &&
                                                                                                  index <=
                                                                                                    285
                                                                                                ? (disciple.theirFamilyGroup =
                                                                                                    allFamilyGroups[44]?.id) // 3
                                                                                                : index >=
                                                                                                      286 &&
                                                                                                    index <=
                                                                                                      292
                                                                                                  ? (disciple.theirFamilyGroup =
                                                                                                      allFamilyGroups[45]?.id) // 7
                                                                                                  : index >=
                                                                                                        293 &&
                                                                                                      index <=
                                                                                                        298
                                                                                                    ? (disciple.theirFamilyGroup =
                                                                                                        allFamilyGroups[46]?.id) // 6
                                                                                                    : index >=
                                                                                                          299 &&
                                                                                                        index <=
                                                                                                          302
                                                                                                      ? (disciple.theirFamilyGroup =
                                                                                                          allFamilyGroups[47]?.id) // 4
                                                                                                      : index >=
                                                                                                            303 &&
                                                                                                          index <=
                                                                                                            307
                                                                                                        ? (disciple.theirFamilyGroup =
                                                                                                            allFamilyGroups[48]?.id) // 5
                                                                                                        : index >=
                                                                                                              308 &&
                                                                                                            index <=
                                                                                                              312
                                                                                                          ? (disciple.theirFamilyGroup =
                                                                                                              allFamilyGroups[49]?.id) // 5
                                                                                                          : index >=
                                                                                                                313 &&
                                                                                                              index <=
                                                                                                                320
                                                                                                            ? (disciple.theirFamilyGroup =
                                                                                                                allFamilyGroups[50]?.id) // 8
                                                                                                            : index >=
                                                                                                                  321 &&
                                                                                                                index <=
                                                                                                                  326
                                                                                                              ? (disciple.theirFamilyGroup =
                                                                                                                  allFamilyGroups[51]?.id) // 6
                                                                                                              : index >=
                                                                                                                    327 &&
                                                                                                                  index <=
                                                                                                                    331
                                                                                                                ? (disciple.theirFamilyGroup =
                                                                                                                    allFamilyGroups[52]?.id) // 5
                                                                                                                : index >=
                                                                                                                      332 &&
                                                                                                                    index <=
                                                                                                                      339
                                                                                                                  ? (disciple.theirFamilyGroup =
                                                                                                                      allFamilyGroups[53]?.id) // 8
                                                                                                                  : index >=
                                                                                                                        340 &&
                                                                                                                      index <=
                                                                                                                        346
                                                                                                                    ? (disciple.theirFamilyGroup =
                                                                                                                        allFamilyGroups[54]?.id) // 7
                                                                                                                    : index >=
                                                                                                                          347 &&
                                                                                                                        index <=
                                                                                                                          355
                                                                                                                      ? (disciple.theirFamilyGroup =
                                                                                                                          allFamilyGroups[55]?.id) // 9
                                                                                                                      : index >=
                                                                                                                            356 &&
                                                                                                                          index <=
                                                                                                                            360
                                                                                                                        ? (disciple.theirFamilyGroup =
                                                                                                                            allFamilyGroups[56]?.id) // 5
                                                                                                                        : index >=
                                                                                                                              361 &&
                                                                                                                            index <=
                                                                                                                              366
                                                                                                                          ? (disciple.theirFamilyGroup =
                                                                                                                              allFamilyGroups[57]?.id) // 6
                                                                                                                          : index >=
                                                                                                                                367 &&
                                                                                                                              index <=
                                                                                                                                371
                                                                                                                            ? (disciple.theirFamilyGroup =
                                                                                                                                allFamilyGroups[58]?.id) // 5
                                                                                                                            : (disciple.theirFamilyGroup =
                                                                                                                                allFamilyGroups[59]?.id); // 6

      promisesDisciple.push(this.discipleService.create(disciple, user));
    });

    await Promise.all(promisesDisciple);
  }

  //? Insert Offering Income
  private async insertNewOfferingIncome(user: User) {
    const sundayServiceOfferingIncome =
      dataOfferingIncome.sundayServiceOfferingIncome;
    const familyGroupOfferingIncome =
      dataOfferingIncome.familyGroupOfferingIncome;
    const sundaySchoolOfferingIncome =
      dataOfferingIncome.sundaySchoolOfferingIncome;
    const unitedServiceOfferingIncome =
      dataOfferingIncome.unitedServiceOfferingIncome;
    const fastingAndVigilOfferingIncome =
      dataOfferingIncome.fastingAndVigilOfferingIncome;
    const youthServiceOfferingIncome =
      dataOfferingIncome.youthServiceOfferingIncome;
    const churchGroundOfferingIncome =
      dataOfferingIncome.churchGroundOfferingIncome;
    const specialOfferingIncome = dataOfferingIncome.specialOfferingIncome;
    const activitiesOfferingIncome =
      dataOfferingIncome.activitiesOfferingIncome;
    const adjustmentOfferingIncome =
      dataOfferingIncome.adjustmentOfferingIncome;

    const promisesSundayServiceOfferingIncome = [];
    const promisesFamilyGroupOfferingIncome = [];
    const promisesSundaySchoolOfferingIncome = [];
    const promisesUnitedServiceOfferingIncome = [];
    const promisesFastingAndVigilOfferingIncome = [];
    const promisesYouthServiceOfferingIncome = [];
    const promisesChurchGroundOfferingIncome = [];
    const promisesSpecialOfferingIncome = [];
    const promisesActivitiesOfferingIncome = [];
    const promisesAdjustmentOfferingIncome = [];

    const mainChurch = await this.churchRepository.findOne({
      where: { isAnexe: false },
    });

    const allFamilyGroups = await this.familyGroupRepository.find({
      where: { theirChurch: mainChurch },
      take: 7,
    });

    const allDisciples = await this.discipleRepository.find({
      where: { theirChurch: mainChurch },
      take: 7,
    });

    //* Sunday Service
    sundayServiceOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesSundayServiceOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesSundayServiceOfferingIncome);

    //* Family Group
    familyGroupOfferingIncome.forEach((offering, index) => {
      if (index <= 6) {
        offering.churchId = mainChurch?.id;
        offering.familyGroupId = allFamilyGroups[index]?.id;
      } else {
        offering.churchId = mainChurch?.id;
        offering.familyGroupId = undefined;
      }

      promisesFamilyGroupOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesFamilyGroupOfferingIncome);

    //* Sunday Service
    sundaySchoolOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesSundaySchoolOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesSundaySchoolOfferingIncome);

    //* United Service
    unitedServiceOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesUnitedServiceOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesUnitedServiceOfferingIncome);

    //* Fasting and Vigil
    fastingAndVigilOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesFastingAndVigilOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesFastingAndVigilOfferingIncome);

    //* Youth Service
    youthServiceOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesYouthServiceOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesYouthServiceOfferingIncome);

    //* Church Ground
    churchGroundOfferingIncome.forEach((offering, index) => {
      if (index <= 6) {
        offering.churchId = mainChurch?.id;
        offering.memberId = allDisciples[index]?.id;
      } else {
        offering.churchId = mainChurch?.id;
        offering.memberId = undefined;
      }

      promisesChurchGroundOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesChurchGroundOfferingIncome);

    //* Special
    specialOfferingIncome.forEach((offering, index) => {
      if (index <= 6) {
        offering.churchId = mainChurch?.id;
        offering.memberId = allDisciples[index]?.id;
      } else {
        offering.churchId = mainChurch?.id;
        offering.memberId = undefined;
      }

      promisesSpecialOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesSpecialOfferingIncome);

    //* Activities OfferingIncome
    activitiesOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesActivitiesOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesActivitiesOfferingIncome);

    //* Adjustment OfferingIncome
    adjustmentOfferingIncome.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesAdjustmentOfferingIncome.push(
        this.offeringIncomeService.create(offering, user),
      );
    });

    await Promise.all(promisesAdjustmentOfferingIncome);
  }

  //? Insert Offering Expenses
  private async insertNewOfferingExpenses(user: User) {
    const operationalOfferingExpenses =
      dataOfferingExpenses.operationalOfferingExpenses;
    const maintenanceAndRepairOfferingExpenses =
      dataOfferingExpenses.maintenanceAndRepairOfferingExpenses;
    const decorationOfferingExpenses =
      dataOfferingExpenses.decorationOfferingExpenses;
    const equipmentAndTechnologyOfferingExpenses =
      dataOfferingExpenses.equipmentAndTechnologyOfferingExpenses;
    const suppliesOfferingExpenses =
      dataOfferingExpenses.suppliesOfferingExpenses;
    const planingEventsOfferingExpenses =
      dataOfferingExpenses.planingEventsOfferingExpenses;
    const otherOfferingExpenses = dataOfferingExpenses.otherOfferingExpenses;
    const adjustmentOfferingExpenses =
      dataOfferingExpenses.adjustmentOfferingExpenses;

    const promisesOperationalOfferingExpenses = [];
    const promisesMaintenanceAndRepairOfferingExpenses = [];
    const promisesDecorationOfferingExpenses = [];
    const promisesEquipmentAndTechnologyOfferingExpenses = [];
    const promisesSuppliesOfferingExpenses = [];
    const promisesPlaningEventsOfferingExpenses = [];
    const promisesOtherOfferingExpenses = [];
    const promisesAdjustmentOfferingExpenses = [];

    const mainChurch = await this.churchRepository.findOne({
      where: { isAnexe: false },
    });

    //* Operational
    operationalOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesOperationalOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesOperationalOfferingExpenses);

    //* Maintenance And Repair
    maintenanceAndRepairOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesMaintenanceAndRepairOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesMaintenanceAndRepairOfferingExpenses);

    //* Decoration
    decorationOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesDecorationOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesDecorationOfferingExpenses);

    //* Equipment and Technology
    equipmentAndTechnologyOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesEquipmentAndTechnologyOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesEquipmentAndTechnologyOfferingExpenses);

    //* Supplies
    suppliesOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesSuppliesOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesSuppliesOfferingExpenses);

    //* Planing Events
    planingEventsOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesPlaningEventsOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesPlaningEventsOfferingExpenses);

    //* Other Expenses
    otherOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesOtherOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesOtherOfferingExpenses);

    //* Adjustment Expenses
    adjustmentOfferingExpenses.forEach((offering) => {
      offering.churchId = mainChurch?.id;

      promisesAdjustmentOfferingExpenses.push(
        this.offeringExpenseService.create(offering, user),
      );
    });

    await Promise.all(promisesAdjustmentOfferingExpenses);
  }

  // TODO : revisar que esten en sus respectivas casa y que no haiga vacias

  //? PRIVATE METHODS
  // For future index errors or constrains with code.
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected errors, check server logs',
    );
  }
}
