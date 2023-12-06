import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import { Preacher } from 'src/preacher/entities/preacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FamilyHome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  code: string;

  @Column('text', { unique: true })
  name_home: string;

  @Column('int', { default: 0 })
  count_members: number;

  //* Address
  @Column('text')
  district: string;

  @Column('text')
  address: string;

  //* User create and update
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
  members: string[];

  //* Relation columns
  //! Revisar si el eager en tru no afecta.
  @OneToOne(() => Preacher, { eager: true })
  @JoinColumn({ name: 'their_preacher_id' })
  their_preacher: Preacher;

  @ManyToOne(() => CoPastor, { eager: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @OneToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}
