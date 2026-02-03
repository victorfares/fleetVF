import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'agencies' })
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

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
}
