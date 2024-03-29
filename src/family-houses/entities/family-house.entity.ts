import { User } from 'src/users/entities/user.entity';
import { CoPastor } from '../../copastors/entities/copastor.entity';
import { Pastor } from '../../pastors/entities/pastor.entity';
import { Preacher } from '../../preachers/entities/preacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'family_houses' })
export class FamilyHouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  zone: string;

  @Column('text')
  number_home: string;

  @Column('text', { unique: true })
  code: string;

  @Column('text', { unique: true })
  name_home: string;

  @Column('bool', { default: true })
  is_active: boolean;

  //* Address
  @Column('text', { default: 'Lima' })
  province: string;

  @Column('text')
  district: string;

  @Column('text')
  address: string;

  @Column('int', { default: 0 })
  count_members: number;

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

  //* Array id (data)
  @Column('uuid', { array: true, nullable: true })
  members: string[];

  //* Relation columns

  @OneToOne(() => Preacher, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_preacher_id' })
  their_preacher: Preacher;

  @ManyToOne(() => CoPastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ManyToOne(() => Pastor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
