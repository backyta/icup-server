import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Member {
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
  nationality: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  @Column('bool', { default: true })
  is_active: boolean;

  //? Agregar fecha de creacion y fecha de actualizacion y usuario que creo y usuario

  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  //Seria con id de usuario
  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Antes de cada insercion en DB (esto setea de manera statica)
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

// TODO : Al final agregar fecha de creacion y fecha de actualizacion segun usuario.
//! Agregar un boton al consultrar por ID para pantalla aperte de miembro (ahi se actualiza la edad).
