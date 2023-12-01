import { CoPastor } from 'src/copastor/entities/copastor.entity';
import { Pastor } from 'src/pastor/entities/pastor.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
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
  date_joinig: Date;

  @Column('text')
  origin_country: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  @Column('bool', { default: true })
  is_active: boolean;

  //* Info adress

  @Column('text', { default: 'Peru' })
  residence_country: string;

  @Column('text', { default: 'Lima' })
  departament: string;

  @Column('text', { default: 'Lima' })
  province: string;

  @Column('text')
  district: string;

  @Column('text')
  address: string;

  //* Info register and update date
  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  //Seria con id de usuario
  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Relations
  // @OneToOne(() => FamilyHome, { eager: true })
  // @JoinColumn({ name: 'family_home_id' })
  // its_family_home: FamilyHome;
  //! Cuidado con el eager en true, al hacer un queryBuilder en el member, busca tmb o carga el pastor
  //! de manera recursiva, y al no encontrar da error, igual con el copastor.
  @OneToOne(() => Pastor)
  @JoinColumn({ name: 'pastor_id' })
  their_pastor: Pastor;

  @OneToOne(() => CoPastor)
  @JoinColumn({ name: 'copastor_id' })
  their_copastor: CoPastor;

  // @OneToOne(() => Preacher, { eager: true })
  // @JoinColumn({ name: 'preacher_id' })
  // their_preacher: CoPastor;

  //* Functions internas
  @BeforeInsert()
  @BeforeUpdate()
  transformToDates() {
    this.date_birth = new Date(this.date_birth);
    this.date_joinig = new Date(this.date_joinig);

    //* Generate age with date_birth
    const ageMiliSeconds = Date.now() - this.date_birth.getTime();

    const ageDate = new Date(ageMiliSeconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    this.age = age;
  }
}

//TODO : agregar earger en true cuando tengas ma relaciones en esta entidad, para que los metodos que usen este modulo se cargen autonmaticaente.
