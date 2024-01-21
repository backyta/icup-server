import { Member } from '../../members/entities/member.entity';
import { FamilyHome } from '../../family-home/entities/family-home.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CoPastor } from '../../copastor/entities/copastor.entity';

@Entity()
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

  //* Info register and update date
  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Relations

  //? Ofrenda casa-familiar
  @ManyToOne(() => FamilyHome, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'family_home_id' })
  family_home: FamilyHome;

  //? Diezmo (personal)
  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  //? Ofrenda ayunoZonal (copastor_id)
  @ManyToOne(() => CoPastor, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'copastor_id' })
  copastor: CoPastor;
}
