import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/modules/user/entities';
import { Pastor } from '@/modules/pastor/entities';
import { Copastor } from '@/modules/copastor/entities';
import { Preacher } from '@/modules/preacher/entities';
import { Supervisor } from '@/modules/supervisor/entities';

@Entity({ name: 'family_houses' })
export class FamilyHouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //General info
  @Column('text', { name: 'house_name', unique: true })
  houseName: string;

  @Column('text', { name: 'house_zone' })
  houseZone: string;

  @Column('text', { name: 'house_number' })
  houseNumber: string;

  @Column('text', { name: 'code_house', unique: true })
  codeHouse: string;

  @Column('text', { name: 'worship_time', unique: true })
  worshipTime: string;

  // Disciples amount who belong to the house
  @Column('int', { name: 'number_disciples', default: 0 })
  numberDisciples: number;

  // Disciples who belong to the house
  @Column('uuid', { name: 'disciples_id', array: true, nullable: true })
  disciplesId: string[];

  // Contact Info
  @Column('text', { name: 'country', default: 'Peru' })
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

  @Column('text', { name: 'status', default: true })
  status: string;

  // Relations
  @ManyToOne(() => Pastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_pastor_id' })
  theirPastorId: Pastor;

  @ManyToOne(() => Copastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_copastor_id' })
  theirCopastorId: Copastor;

  @OneToOne(() => Supervisor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_supervisor_id' })
  theirSupervisorId: Supervisor;

  @OneToOne(() => Preacher, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_preacher_id' })
  theirPreacherId: Preacher;
}
