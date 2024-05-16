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

@Entity({ name: 'co_pastors' })
export class CoPastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_houses: number;

  @Column('int', { default: 0 })
  count_preachers: number;

  @Column('text', { default: true })
  status: string;

  @Column('uuid', { array: true, nullable: true })
  preachers: string[];

  @Column('uuid', { array: true, nullable: true })
  family_houses: string[];

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

  //* Relations Column
  @OneToOne(() => Disciple, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Disciple;

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
