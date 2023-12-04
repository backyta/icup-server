import { Member } from '../../members/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Pastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_copastores: number;

  @Column('int', { default: 0 })
  count_preachers: number;

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

  @Column('uuid', { array: true, nullable: true })
  copastores: string[];

  @Column('uuid', { array: true, nullable: true })
  preachers: string[];

  //* Relation columns
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  //NOTE : Al actualizar si el id del pastor le asigno otro copastores, gracias a esta relacion, se actualiza el id del pastor en la tabla copastor.
  // @OneToMany(() => CoPastor, (copastor) => copastor.pastor, { nullable: true })
  // copastores: CoPastor[]; // esto no se mostrara en la tabla, pero la cargamos aparte.
}

//! Se agregaria el id del usuario en creacion y actualizacion (relacion) CRATED by
//* Esta propiedad tmb seria una relacion con @OneToOne, igual que abajo para tomar la info del usuario que creo, y devuelvo olo la que necesito en este caso el ID
