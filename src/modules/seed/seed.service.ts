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
      await queryUsers
        .delete()
        .where('NOT (:role = ANY(roles))', { role: 'super-user' }) // delete user without super user role
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }

    const superUser = await this.insertUsers();

    await this.insertNewMembers(superUser);

    return 'SEED EXECUTED';
  }

  //* Insertar Usuarios
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

  //* Insertar Churches
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

    //* Create Main Church
    await this.churchService.create(church[0], user);

    const mainChurch = await this.churchRepository.findOne({
      where: { isAnexe: false },
      relations: ['anexes', 'theirMainChurch'],
    });

    //* Create Anexes
    anexes.forEach((anexe) => {
      anexe.theirMainChurch = mainChurch?.id;

      promisesAnexes.push(this.churchService.create(anexe, user));
    });

    await Promise.all(promisesAnexes);

    //* Create Pastor
    pastors.forEach((pastor) => {
      pastor.theirChurch = mainChurch?.id;

      promisesPastor.push(this.pastorService.create(pastor, user));
    });

    await Promise.all(promisesPastor);

    //* Create Copastor
    const pastor = await this.pastorRepository.findOne({
      where: { member: { firstNames: 'Michael Rodrigo' } },
    });

    copastors.forEach((copastor) => {
      copastor.theirPastor = pastor?.id;

      promisesCopastor.push(this.copastorService.create(copastor, user));
    });

    await Promise.all(promisesCopastor);

    //* Create Supervisor
    const copastor = await this.copastorRepository.findOne({
      where: { member: { firstNames: 'Luz Mariella' } },
    });

    supervisors.forEach((supervisor) => {
      supervisor.theirCopastor = copastor.id;

      promisesSupervisor.push(this.supervisorService.create(supervisor, user));
    });

    await Promise.all(promisesSupervisor);

    //* Create Zones
    const allSupervisors = await this.supervisorRepository.find();

    let i = 0;
    zones.forEach((zone) => {
      zone.theirSupervisor = allSupervisors[i].id;
      promisesZone.push(this.zoneService.create(zone, user));
      i++;
    });

    await Promise.all(promisesZone);

    //* Create Preachers
    const supervisor = await this.supervisorRepository.findOne({
      where: { member: { lastNames: 'Lopez Martinez' } },
    });

    preachers.forEach((preacher) => {
      preacher.theirSupervisor = supervisor.id;

      promisesPreacher.push(this.preacherService.create(preacher, user));
    });

    await Promise.all(promisesPreacher);

    //* Create Family Houses
    const allPreachers = await this.preacherRepository.find({
      relations: ['theirZone'],
    });

    async function crearCasasEnOrden(
      familyGroups,
      allPreachers,
      user,
      familyGroupService,
    ) {
      const promisesCreation = [];

      for (const [index, familyGroup] of familyGroups.entries()) {
        familyGroup.theirZone = allPreachers[0]?.theirZone?.id;
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

    await crearCasasEnOrden(
      familyGroups,
      allPreachers,
      user,
      this.familyGroupService,
    );

    //* Create Disciples
    const allFamilyGroups = await this.familyGroupRepository.find({
      relations: ['theirPreacher'],
    });

    //? First House
    disciples[0].theirFamilyGroup = allFamilyGroups[0]?.id;
    await this.discipleService.create(disciples[0], user);

    disciples[1].theirFamilyGroup = allFamilyGroups[0]?.id;
    await this.discipleService.create(disciples[1], user);

    disciples[2].theirFamilyGroup = allFamilyGroups[0]?.id;
    await this.discipleService.create(disciples[2], user);

    disciples[3].theirFamilyGroup = allFamilyGroups[0]?.id;
    await this.discipleService.create(disciples[3], user);

    //? Second House
    disciples[4].theirFamilyGroup = allFamilyGroups[1]?.id;
    await this.discipleService.create(disciples[4], user);

    disciples[5].theirFamilyGroup = allFamilyGroups[1]?.id;
    await this.discipleService.create(disciples[5], user);

    disciples[6].theirFamilyGroup = allFamilyGroups[1]?.id;
    await this.discipleService.create(disciples[6], user);

    disciples[7].theirFamilyGroup = allFamilyGroups[1]?.id;
    await this.discipleService.create(disciples[7], user);

    //? Third House
    disciples[8].theirFamilyGroup = allFamilyGroups[2]?.id;
    await this.discipleService.create(disciples[8], user);

    disciples[9].theirFamilyGroup = allFamilyGroups[2]?.id;
    await this.discipleService.create(disciples[9], user);

    disciples[10].theirFamilyGroup = allFamilyGroups[2]?.id;
    await this.discipleService.create(disciples[10], user);

    disciples[11].theirFamilyGroup = allFamilyGroups[2]?.id;
    await this.discipleService.create(disciples[11], user);

    //? Fourth House
    disciples[12].theirFamilyGroup = allFamilyGroups[3]?.id;
    await this.discipleService.create(disciples[12], user);

    disciples[13].theirFamilyGroup = allFamilyGroups[3]?.id;
    await this.discipleService.create(disciples[13], user);

    disciples[14].theirFamilyGroup = allFamilyGroups[3]?.id;
    await this.discipleService.create(disciples[14], user);

    disciples[15].theirFamilyGroup = allFamilyGroups[3]?.id;
    await this.discipleService.create(disciples[15], user);

    //? Fifth House
    disciples[16].theirFamilyGroup = allFamilyGroups[4]?.id;
    await this.discipleService.create(disciples[16], user);

    disciples[17].theirFamilyGroup = allFamilyGroups[4]?.id;
    await this.discipleService.create(disciples[17], user);

    disciples[18].theirFamilyGroup = allFamilyGroups[4]?.id;
    await this.discipleService.create(disciples[18], user);

    disciples[19].theirFamilyGroup = allFamilyGroups[4]?.id;
    await this.discipleService.create(disciples[19], user);
  }

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
