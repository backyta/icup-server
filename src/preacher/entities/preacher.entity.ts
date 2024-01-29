import { User } from 'src/users/entities/user.entity';
import { CoPastor } from '../../copastor/entities/copastor.entity';
import { Member } from '../../members/entities/member.entity';
import { Pastor } from '../../pastor/entities/pastor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'preachers' })
export class Preacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_members: number;

  @Column('bool', { default: true })
  is_active: boolean;

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
  @OneToOne(() => Member, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => CoPastor, { eager: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
