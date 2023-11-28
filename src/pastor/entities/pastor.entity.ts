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
  //! Colocar en Miembro relacion One to One.
  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @OneToMany(() => CoPastor, (copastor) => copastor.pastor, { eager: true })
  //@JoinColumn({ name: 'copastores_id' })
  copastores: CoPastor[];

  //* Probar
  // @BeforeInsert()
  // @BeforeUpdate()
  // countCopastores() {
  //   this.count_copastor = this.copastor ? this.copastor.length : 0;
  // }
}

//! Se agregaria el id del usuario en creacion y actualizacion (relacion) CRATED by
//* Esta propiedad tmb seria una relacion con @OneToOne, igual que abajo para tomar la info del usuario que creo, y devuelvo olo la que necesito en este caso el ID
