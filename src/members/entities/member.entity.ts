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
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'members' })
export class Member {
  //* Info member
  // @ApiProperty({
  //   example: 'a93feeeb-8282-4b29-83cf-22a148f46245',
  //   description: 'Member ID',
  //   uniqueItems: true,
  // })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'John Alex',
    description: 'First Name Member',
  })
  @Column('text')
  first_name: string;

  // @ApiProperty({
  //   example: 'John Alex',
  //   description: 'First Name Member',
  //   uniqueItems: true,
  // })
  @Column('text')
  last_name: string;

  @ApiProperty()
  @Column('date')
  date_birth: Date;

  @ApiProperty()
  @Column('int')
  age: number;

  @ApiProperty()
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', { unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column('text')
  marital_status: string;

  @ApiProperty()
  @Column('int', { default: 0 })
  number_children: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  phone: string;

  @ApiProperty()
  @Column('date')
  date_joining: Date;

  @ApiProperty()
  @Column('text')
  origin_country: string;

  @ApiProperty()
  @Column({ type: 'text', array: true })
  roles: string[];

  @ApiProperty()
  @Column('bool', { default: true })
  is_active: boolean;

  //* Info address

  @ApiProperty()
  @Column('text', { default: 'Peru' })
  residence_country: string;

  @ApiProperty()
  @Column('text', { default: 'Lima' })
  department: string;

  @ApiProperty()
  @Column('text', { default: 'Lima' })
  province: string;

  @ApiProperty()
  @Column('text')
  district: string;

  @ApiProperty()
  @Column('text')
  address: string;

  @ApiProperty() //* Info register and update date
  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @ApiProperty()
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  created_by: User;

  @ApiProperty()
  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @ApiProperty()
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updated_by: User;

  //* Relations
  @ApiProperty()
  @ManyToOne(() => FamilyHouse, { nullable: true })
  @JoinColumn({ name: 'their_family_home_id' })
  their_family_home: FamilyHouse;

  @ApiProperty()
  @ManyToOne(() => Pastor, { nullable: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;

  @ApiProperty()
  @ManyToOne(() => CoPastor, { nullable: true })
  @JoinColumn({ name: 'their_copastor_id' })
  their_copastor: CoPastor;

  @ApiProperty()
  @ManyToOne(() => Preacher, { nullable: true })
  @JoinColumn({ name: 'their_preacher_id' })
  their_preacher: Preacher;

  // @ManyToOne(() => User, (user) => user.member)
  // user: User;

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
