import { Member } from '../../members/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Pastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_copastores: number;

  @Column('int', { default: 0 })
  count_preachers: number;

  @Column('bool', { default: true })
  is_active: boolean;

  //* User create and updated
  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Array id (data)
  @Column('uuid', { array: true, nullable: true })
  copastores: string[];

  @Column('uuid', { array: true, nullable: true })
  preachers: string[];

  //* Relation columns
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
