import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';

@Entity({ name: 'agencies' })
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Car, (car) => car.agency)
  cars: Car[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
