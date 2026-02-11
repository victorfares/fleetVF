import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { Rental } from './entities/rental.entity';

// Importe os módulos que o serviço de aluguel vai precisar consultar
import { CarsModule } from '../cars/cars.module';
import { UsersModule } from '../users/users.module';
import { AgenciesModule } from '../agencies/agencies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental]),
    CarsModule,
    UsersModule,
    AgenciesModule,
  ],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}
