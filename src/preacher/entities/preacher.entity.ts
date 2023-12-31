import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Member } from 'src/members/entities/member.entity';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Preacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_members: number;

  @Column('bool', { default: true })
  is_active: boolean;

  @Column('uuid', { array: true, nullable: true })
  members: string[];

  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Relation columns
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => CoPastor, { eager: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
