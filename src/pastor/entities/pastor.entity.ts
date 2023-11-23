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
  countCopastor: number;

  @Column('timestamp', { nullable: true })
  created_at: string | Date;

  //! Se agregaria el id del usuario en creacion y actualizacion (relacion)
  //* Esta propiedad tmb seria una relacion con @OneToOne, igual que abajo para tomar la info del usuario que creo, y devuelvo olo la que necesito en este caso el ID
  @Column('text', { nullable: true })
  created_by: string;

  @Column('timestamp', { nullable: true })
  updated_at: string | Date;

  @Column('text', { nullable: true })
  updated_by: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToOne(() => Member, { eager: true }) // Carga el Miembro automáticamente al consultar Pastor
  @JoinColumn({ name: 'member_id' })
  member: Member;
}

//! Revisar el eager
