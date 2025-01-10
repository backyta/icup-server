import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate } from 'class-validator';

import { RecordStatus } from '../../../common/enums/record-status.enum';

import { User } from '../../../modules/user/entities/user.entity';

@Entity({ name: 'external_donors' })
export class ExternalDonor {
  //* General and personal info
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'first_names' })
  firstNames: string;

  @Column('text', { name: 'last_names' })
  lastNames: string;

  @Column('int', { name: 'age', nullable: true })
  age: number;

  @Column('date', {
    name: 'birth_date',
    default: null,
    nullable: true,
  })
  @IsDate()
  birthDate: Date;

  @Column('text', { name: 'gender' })
  gender: string;

  @Column('text', { name: 'email', unique: true, nullable: true })
  email: string;

  @Column('text', { name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column('text', { name: 'origin_country', nullable: true })
  originCountry: string;

  @Column('text', { name: 'residence_country', nullable: true })
  residenceCountry: string;

  @Column('text', { name: 'residence_city', nullable: true })
  residenceCity: string;

  @Column('text', { name: 'postal_code', nullable: true })
  postalCode: string;

  //* Info register and update date
  @Column('timestamptz', { name: 'created_at', nullable: true })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column('timestamptz', { name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column('text', {
    name: 'record_status',
    default: RecordStatus.Active,
  })
  recordStatus: string;

  //? Internal Functions
  @BeforeInsert()
  @BeforeUpdate()
  transformToDates() {
    this.birthDate = new Date(this.birthDate);

    // Generate age with birth date
    const ageMiliSeconds = Date.now() - this.birthDate.getTime();

    const ageDate = new Date(ageMiliSeconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    this.age = age ?? 0;
  }
}
