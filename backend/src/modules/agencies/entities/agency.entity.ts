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
import { Exclude } from 'class-transformer';

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
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Exclude()
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.agency)
  @Exclude()
  cars: Car[];

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude()
  deletedAt?: Date;

  @OneToMany(() => Rental, (rental) => rental.pickupAgency)
  @Exclude()
  pickupRentals: Rental[];

  @OneToMany(() => Rental, (rental) => rental.returnAgency)
  @Exclude()
  returnRentals: Rental[];
}
