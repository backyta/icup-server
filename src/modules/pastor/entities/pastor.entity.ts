import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Status } from '@/modules/disciple/enums';

import { User } from '@/modules/user/entities';
import { Disciple } from '@/modules/disciple/entities';

@Entity({ name: 'pastors' })
export class Pastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Roles amount under their charge
  @Column('int', { name: 'number_copastors', default: 0 })
  numberCopastors: number;

  @Column('int', { name: 'number_supervisors', default: 0 })
  numberSupervisors: number;

  @Column('int', { name: 'number_preachers', default: 0 })
  numberPreachers: number;

  @Column('int', { name: 'number_zones', default: 0 })
  numberZones: number;

  @Column('int', { name: 'number_family_houses', default: 0 })
  numberFamilyHouses: number;

  @Column('int', { name: 'number_disciples', default: 0 })
  numberDisciples: number;

  // Id roles under their charge
  @Column('uuid', { name: 'copastors_id', array: true, nullable: true })
  copastorsId: string[];

  @Column('uuid', { name: 'supervisors_id', array: true, nullable: true })
  supervisorsId: string[];

  @Column('uuid', { name: 'preachers_id', array: true, nullable: true })
  preachersId: string[];

  @Column('uuid', { name: 'zones_id', array: true, nullable: true })
  zonesId: string[];

  @Column('uuid', { name: 'family_houses_id', array: true, nullable: true })
  familyHousesId: string[];

  @Column('uuid', { name: 'disciples_id', array: true, nullable: true })
  disciplesId: string[];

  // Info register and update date
  @Column('timestamp', { name: 'created_at', nullable: true })
  createdAt: string | Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: string | Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  updatedBy: User;

  @Column('text', { default: Status.Active })
  status: string;

  // Relation columns
  @OneToOne(() => Disciple, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'disciple_id' })
  discipleId: Disciple;
}
