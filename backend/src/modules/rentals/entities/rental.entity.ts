import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';
import { Agency } from '../../agencies/entities/agency.entity';
import { RentalStatus } from '../enums/rental-status.enum';

@Entity({ name: 'rentals' })
export class Rental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- DATAS ---
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date; // Data agendada para retirada

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date; // Data agendada para devolução

  @Column({ name: 'real_return_date', type: 'timestamp', nullable: true })
  realReturnDate: Date; // Quando o carro foi efetivamente devolvido (pode gerar multa de atraso)

  @Column('decimal', {
    name: 'total_value',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalValue: number;

  @Column('decimal', { name: 'daily_rate_snapshot', precision: 10, scale: 2 })
  dailyRateSnapshot: number;

  @Column({ name: 'start_mileage', type: 'int', nullable: true })
  startMileage: number;

  @Column({ name: 'end_mileage', type: 'int', nullable: true })
  endMileage: number;

  @Column({
    type: 'enum',
    enum: RentalStatus,
    default: RentalStatus.PENDING,
  })
  status: RentalStatus;

  @ManyToOne(() => User, (user) => user.rentals)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Car, (car) => car.rentals)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ name: 'car_id' })
  carId: string;

  @ManyToOne(() => Agency)
  @JoinColumn({ name: 'pickup_agency_id' })
  pickupAgency: Agency;

  @Column({ name: 'pickup_agency_id' })
  pickupAgencyId: string;

  @ManyToOne(() => Agency)
  @JoinColumn({ name: 'return_agency_id' })
  returnAgency: Agency;

  @Column({ name: 'return_agency_id' })
  returnAgencyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
