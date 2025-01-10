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

import { Zone } from '../../../modules/zone/entities/zone.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Church } from '../../../modules/church/entities/church.entity';
import { Pastor } from '../../../modules/pastor/entities/pastor.entity';
import { Copastor } from '../../../modules/copastor/entities/copastor.entity';
import { Preacher } from '../../../modules/preacher/entities/preacher.entity';
import { Disciple } from '../../../modules/disciple/entities/disciple.entity';
import { Supervisor } from '../../../modules/supervisor/entities/supervisor.entity';

@Entity({ name: 'family_groups' })
export class FamilyGroup {
  //* General info
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'family_group_name', unique: true })
  familyGroupName: string;

  @Column('int', { name: 'family_group_number' })
  familyGroupNumber: number;

  @Column('text', { name: 'family_group_code', nullable: true })
  familyGroupCode: string;

  @Column('text', { name: 'service_time' })
  serviceTime: string;

  //* Contact Info
  @Column('text', { name: 'country', default: 'Perú' })
  country: string;

  @Column('text', { name: 'department', default: 'Lima' })
  department: string;

  @Column('text', { name: 'province', default: 'Lima' })
  province: string;

  @Column('text', { name: 'district' })
  district: string;

  @Column('text', { name: 'urban_sector' })
  urbanSector: string;

  @Column('text')
  address: string;

  @Column('text', { name: 'reference_address' })
  referenceAddress: string;

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
  @OneToMany(() => Disciple, (disciple) => disciple.theirFamilyGroup)
  disciples: Disciple[];

  //* Relations(FK)
  @ManyToOne(() => Church, (church) => church.familyGroups)
  @JoinColumn({ name: 'their_church_id' })
  theirChurch: Church;

  @ManyToOne(() => Pastor, (pastor) => pastor.familyGroups)
  @JoinColumn({ name: 'their_pastor_id' })
  theirPastor: Pastor;

  @ManyToOne(() => Copastor, (copastor) => copastor.familyGroups, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'their_copastor_id' })
  theirCopastor: Copastor;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.familyGroups, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'their_supervisor_id' })
  theirSupervisor: Supervisor;

  @ManyToOne(() => Zone, (zone) => zone.familyGroups)
  @JoinColumn({ name: 'their_zone_id' })
  theirZone: Zone;

  @OneToOne(() => Preacher, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'their_preacher_id' })
  theirPreacher: Preacher;
}
