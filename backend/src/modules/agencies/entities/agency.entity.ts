import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';
import { Rental } from 'src/modules/rentals/entities/rental.entity';

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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.agency)
  cars: Car[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Rental, (rental) => rental.pickupAgency)
  pickupRentals: Rental[];

  @OneToMany(() => Rental, (rental) => rental.returnAgency)
  returnRentals: Rental[];
}
