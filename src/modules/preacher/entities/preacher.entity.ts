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
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Supervisor } from '@/modules/supervisor/entities';

@Entity({ name: 'preachers' })
export class Preacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Roles amount under their charge
  @Column('int', { name: 'number_family_houses', default: 0 })
  numberFamilyHouses: number;

  @Column('int', { name: 'number_disciples', default: 0 })
  numberDisciples: number;

  // Id roles under their charge
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

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  theirPastorId: Pastor;

  @ManyToOne(() => Copastor, { eager: true })
  @JoinColumn({ name: 'their_copastor_id' })
  theirCopastorId: Copastor;

  @ManyToOne(() => Supervisor, { eager: true })
  @JoinColumn({ name: 'their_supervisor_id' })
  theirSupervisorId: Pastor;
}
