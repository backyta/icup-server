import { CoPastor } from '../../copastor/entities/copastor.entity';
import { Member } from '../../members/entities/member.entity';
import {
  //BeforeInsert,
  //BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Pastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_copastor: number;

  @Column('bool', { default: true })
  is_active: boolean;

  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  //* Relation columns
  //! Hacer eliminacion en cascara si, se elimina un member tmb su pasto, y viceversa
  //! Igual con copastor y pracher para evitar esata resticciones al querer borrar o no ? (estudiar)
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  //NOTE : Al actualizar si el id del pastor le asigno otro copastores, gracias a esta relacion, se actualiza el id del pastor en la tabla copastor.
  @OneToMany(() => CoPastor, (copastor) => copastor.pastor, { nullable: true })
  copastores: CoPastor[]; // esto no se mostrara en la tabla, pero la cargamos aparte.
}

//! Se agregaria el id del usuario en creacion y actualizacion (relacion) CRATED by
//* Esta propiedad tmb seria una relacion con @OneToOne, igual que abajo para tomar la info del usuario que creo, y devuelvo olo la que necesito en este caso el ID
