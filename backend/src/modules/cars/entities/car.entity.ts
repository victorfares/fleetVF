import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { CarStatus } from '../enums/car-status.enum';

@Entity({ name: 'cars' })
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column({ name: 'license_plate', unique: true })
  licensePlate: string;

  @Column('decimal', { name: 'daily_rate', precision: 10, scale: 2 })
  dailyRate: number;

  @Column({ name: 'current_mileage', type: 'int' })
  currentMileage: number;

  @Column({
    type: 'enum',
    enum: CarStatus,
    default: CarStatus.AVAILABLE, // Nasce disponível por padrão
  })
  status: CarStatus;

  @Column({ name: 'image_url', nullable: true }) // Pode ser nulo se não tiver foto
  imageUrl: string;

  @Column({ name: 'agency_id', nullable: true }) 
  agencyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Agency, (agency) => agency.cars, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
