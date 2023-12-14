import { Member } from '../../members/entities/member.entity';
import { Pastor } from '../../pastor/entities/pastor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CoPastor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  count_houses: number;

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
  preachers: string[];

  @Column('uuid', { array: true, nullable: true })
  family_houses: string[];

  //* Relations Column
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Pastor, { eager: true })
  @JoinColumn({ name: 'their_pastor_id' })
  their_pastor: Pastor;
}

//TODO : Se agregaria el id del usuario en creacion y actualizacion (relacion) Created By y updated By
//* Esta propiedad tmb seria una relacion con @OneToOne, igual que abajo para tomar la info del usuario que creo, y devuelvo olo la que necesito en este caso el ID
