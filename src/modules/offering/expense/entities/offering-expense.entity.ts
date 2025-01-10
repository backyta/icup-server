import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RecordStatus } from '../../../../common/enums/record-status.enum';

import { User } from '../../../../modules/user/entities/user.entity';
import { Church } from '../../../../modules/church/entities/church.entity';

@Entity({ name: 'offering_expenses' })
export class OfferingExpense {
  //* General data
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  type: string;

  @Column('text', { name: 'sub_type', nullable: true })
  subType: string;

  @Column('decimal')
  amount: number;

  @Column('text')
  currency: string;

  @Column('text', { name: 'comments', nullable: true })
  comments: string;

  @Column('date', { name: 'date' })
  date: Date;

  @Column('text', { name: 'image_urls', array: true })
  imageUrls: string[];

  @Column('text', { name: 'inactivation_reason', nullable: true })
  inactivationReason: string;

  //* Info register and update date
  @Column('timestamptz', { name: 'created_at', nullable: true })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column('timestamptz', { name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column('text', {
    name: 'record_status',
    default: RecordStatus.Active,
  })
  recordStatus: string;

  //* Relations (FK)
  // Church
  @ManyToOne(() => Church, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'church_id' })
  church: Church;
}
