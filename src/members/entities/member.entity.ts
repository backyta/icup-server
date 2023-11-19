import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'firstname' })
  firstName: string;

  @Column('text', { name: 'lastname' })
  lastName: string;

  @Column('date', { name: 'datebirth' })
  dateOfBirth: Date;

  @Column('int')
  age: number;

  @Column('text')
  gender: string;

  @Column('text', { unique: true, nullable: true })
  email: string;

  @Column('text', { name: 'maritalstatus' })
  maritalStatus: string;

  @Column('int', { default: 0, name: 'numberchildren' })
  numberChildren: number;

  @Column('text', { nullable: true })
  phone: string;

  @Column('date', { name: 'datejoining' })
  dateJoinig: Date;

  @Column('text')
  nationality: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  //* Antes de cada insercion en DB
  @BeforeInsert()
  updateAge() {
    this.dateOfBirth = new Date(this.dateOfBirth);
    this.dateJoinig = new Date(this.dateJoinig);

    const ageMiliSeconds = Date.now() - this.dateOfBirth.getTime();

    const ageDate = new Date(ageMiliSeconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    this.age = age;
  }
}

// TODO : Al final agregar fecha de creacion y fecha de actualizacion segun usuario.
