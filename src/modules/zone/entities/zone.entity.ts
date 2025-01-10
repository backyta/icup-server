import {
  Column,
  Entity,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RecordStatus } from '../../../common/enums/record-status.enum';

import { User } from '../../../modules/user/entities/user.entity';
import { Church } from '../../../modules/church/entities/church.entity';
import { Pastor } from '../../../modules/pastor/entities/pastor.entity';
import { Copastor } from '../../../modules/copastor/entities/copastor.entity';
import { Preacher } from '../../../modules/preacher/entities/preacher.entity';
import { Disciple } from '../../../modules/disciple/entities/disciple.entity';
import { Supervisor } from '../../../modules/supervisor/entities/supervisor.entity';
import { FamilyGroup } from '../../../modules/family-group/entities/family-group.entity';

@Entity({ name: 'zones' })
export class Zone {
  //* General info
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'zone_name' })
  zoneName: string;

  @Column('text', { name: 'country', default: 'Perú' })
  country: string;

  @Column('text', { name: 'department', default: 'Lima' })
  department: string;

  @Column('text', { name: 'province', default: 'Lima' })
  province: string;

  @Column('text', { name: 'district' })
  district: string;

  //* Info register and update date
  @Column('timestamptz', { name: 'created_at', nullable: true })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column('timestamptz', { name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column('text', { name: 'inactivation_category', nullable: true })
  inactivationCategory: string;

  @Column('text', { name: 'inactivation_reason', nullable: true })
  inactivationReason: string;

  @Column('text', {
    name: 'record_status',
    default: RecordStatus.Active,
  })
  recordStatus: string;

  //* Relations (Array)
  @OneToMany(() => Preacher, (preacher) => preacher.theirZone)
  preachers: Preacher[];

  @OneToMany(() => FamilyGroup, (familyGroup) => familyGroup.theirZone)
  familyGroups: FamilyGroup[];

  @OneToMany(() => Disciple, (disciple) => disciple.theirZone)
  disciples: Disciple[];

  //* Relation (FK)
  @ManyToOne(() => Pastor, (pastor) => pastor.zones)
  @JoinColumn({ name: 'their_pastor_id' })
  theirPastor: Pastor;

  @ManyToOne(() => Copastor, (copastor) => copastor.zones, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'their_copastor_id' })
  theirCopastor: Copastor;

  @ManyToOne(() => Church, (church) => church.zones)
  @JoinColumn({ name: 'their_church_id' })
  theirChurch: Church;

  @OneToOne(() => Supervisor, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'their_supervisor_id' })
  theirSupervisor: Supervisor;
}
