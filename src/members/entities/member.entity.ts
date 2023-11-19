import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('date')
  dateOfBirth: Date;

  @Column('int')
  age: number;

  @Column('text')
  genero: string;

  @Column('text', { unique: true, nullable: true })
  email: string;

  @Column('date')
  @Column('text')
  maritalStatus: string;

  @Column('int', { default: 0 })
  numberChildren: number;

  @Column('text', { nullable: true })
  phone: string;

  @Column('date')
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
    console.log(ageMiliSeconds);

    const ageDate = new Date(ageMiliSeconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    console.log(age);

    this.age = age;
  }
}

// TODO : Al final agregar fecha de creacion y fecha de actualizacion segun usuario.
