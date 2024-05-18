import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Supervisor } from '@/modules/supervisor/entities';
import { User } from '@/modules/user/entities';
import { Status } from '@/modules/disciple/enums';

@Entity({ name: 'zones' })
@Unique(['theirSupervisorId'])
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //General info
  @Column('text', { name: 'zone_name', unique: true })
  zoneName: string;

  @Column('int', { name: 'number_preachers', default: 0 })
  numberPreachers: number;

  @Column('int', { name: 'number_family_houses', default: 0 })
  numberFamilyHouses: number;

  @Column('int', { name: 'number_disciples', default: 0 })
  numberDisciples: number;

  // Id roles under their charge
  @Column('uuid', { name: 'preachers_id', array: true, nullable: true })
  preachersId: string[];

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
  @ManyToOne(() => Pastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_pastor_id' })
  theirPastorId: Pastor;

  @ManyToOne(() => Copastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_copastor_id' })
  theirCopastorId: Copastor;

  @OneToOne(() => Supervisor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_supervisor_id' })
  theirSupervisorId: Supervisor;
}
