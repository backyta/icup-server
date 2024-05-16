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

@Entity({ name: 'pastors' })
export class Pastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_copastores: number;

  @Column('int', { default: 0 })
  count_preachers: number;

  @Column('text', { default: true })
  status: string;

  @Column('uuid', { array: true, nullable: true })
  copastores_id: string[];

  @Column('uuid', { array: true, nullable: true })
  preachers_id: string[];

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
}
