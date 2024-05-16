import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/user/entities';
import { Disciple } from '@/disciple/entities';
import { CoPastor } from '@/copastor/entities';
import { FamilyHouse } from '@/family-house/entities';

@Entity({ name: 'offerings' })
export class Offering {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  type: string;

  @Column('text', { nullable: true })
  sub_type: string;

  @Column('int')
  amount: number;

  @Column('text')
  currency: string;

  @Column('text', { nullable: true })
  comments: string;

  @Column('text', { nullable: true })
  url_file: string;

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

  //* Relations

  //? Ofrenda casa-familiar
  @ManyToOne(() => FamilyHouse, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'family_home_id' })
  family_home: FamilyHouse;

  //? Diezmo (personal)
  @ManyToOne(() => Disciple, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Disciple;

  //? Ofrenda ayunoZonal (copastor_id)
  @ManyToOne(() => CoPastor, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'copastor_id' })
  copastor: CoPastor;
}
