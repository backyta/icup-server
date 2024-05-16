import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/user/entities';
import { Disciple } from '@/disciple/entities';
import { Pastor } from '@/pastor/entities';
import { CoPastor } from '@/copastor/entities';

@Entity({ name: 'preachers' })
export class Preacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_members: number;

  @Column('text', { default: true })
  status: string;

  @Column('uuid', { array: true, nullable: true })
  members: string[];

  @Column('uuid', { array: true, nullable: true })
  family_home: string[];

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
  @OneToOne(() => Disciple, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Disciple;

  @ManyToOne(() => CoPastor, { eager: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
