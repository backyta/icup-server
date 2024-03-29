import { User } from 'src/users/entities/user.entity';
import { CoPastor } from '../../copastors/entities/copastor.entity';
import { Pastor } from '../../pastors/entities/pastor.entity';
import { Preacher } from '../../preachers/entities/preacher.entity';
import { FamilyHouse } from '../../family-houses/entities/family-house.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'members' })
export class Member {
  //* Info member

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('date')
  date_birth: Date;

  @Column('int')
  age: number;

  @Column('text')
  gender: string;

  @Column('text', { unique: true, nullable: true })
  email: string;

  @Column('text')
  marital_status: string;

  @Column('int', { default: 0 })
  number_children: number;

  @Column('text', { nullable: true })
  phone: string;

  @Column('date')
  date_joining: Date;

  @Column('text')
  origin_country: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  @Column('bool', { default: true })
  is_active: boolean;

  //* Info address

  @Column('text', { default: 'Peru' })
  residence_country: string;

  @Column('text', { default: 'Lima' })
  department: string;

  @Column('text', { default: 'Lima' })
  province: string;

  @Column('text')
  district: string;

  @Column('text')
  address: string;

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

  @ManyToOne(() => FamilyHouse, { nullable: true })
  @JoinColumn({ name: 'their_family_home_id' })
  their_family_home: FamilyHouse;

  @ManyToOne(() => Pastor, { nullable: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;

  @ManyToOne(() => CoPastor, { nullable: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ManyToOne(() => Preacher, { nullable: true })
  @JoinColumn({ name: 'their_preacher_id' })
  their_preacher: Preacher;

  //* Functions internas
  @BeforeInsert()
  @BeforeUpdate()
  transformToDates() {
    this.date_birth = new Date(this.date_birth);
    this.date_joining = new Date(this.date_joining);

    //* Generate age with date_birth
    const ageMiliSeconds = Date.now() - this.date_birth.getTime();

    const ageDate = new Date(ageMiliSeconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    this.age = age;
  }
}
