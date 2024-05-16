import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/user/entities';
import { Pastor } from '@/pastor/entities';
import { CoPastor } from '@/copastor/entities';
import { Preacher } from '@/preacher/entities';

@Entity({ name: 'family_houses' })
export class FamilyHouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  zone_house: string;

  @Column('text')
  number_house: string;

  @Column('text', { unique: true })
  code_house: string;

  @Column('text', { unique: true })
  name_house: string;

  @Column('int', { default: 0 })
  count_members: number;

  @Column('bool', { default: true })
  is_active: boolean;

  //* Array id (data)
  @Column('uuid', { array: true, nullable: true })
  members: string[];

  //* Address
  //TODO : agregar departamento y país
  @Column('text', { default: 'Peru' })
  country: string;

  @Column('text', { default: 'Lima' })
  department: string;

  @Column('text', { default: 'Lima' })
  province: string;

  @Column('text')
  district: string;

  @Column('text')
  address: string;

  //* Info register and update date
  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  created_by: User;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updated_by: User;

  //* Relation columns

  //TODO : relacionar con supervisor

  @ManyToOne(() => Pastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;

  @ManyToOne(() => CoPastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @OneToOne(() => Preacher, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_preacher_id' })
  their_preacher: Preacher;
}
