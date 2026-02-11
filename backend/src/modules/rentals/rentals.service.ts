import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  In,
} from 'typeorm';
import { differenceInDays } from 'date-fns'; // Recomendo instalar: npm i date-fns

import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { Rental } from './entities/rental.entity';

import { CarsService } from '../cars/cars.service';
import { UsersService } from '../users/users.service';
import { AgenciesService } from '../agencies/agencies.service';
import { CarStatus } from '../cars/enums/car-status.enum';
import { Car } from '../cars/entities/car.entity';
import { RentalStatus } from './enums/rental-status.enum';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    private readonly carsService: CarsService,
    private readonly usersService: UsersService,
    private readonly agenciesService: AgenciesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRentalDto: CreateRentalDto) {
    const {
      userId,
      carId,
      pickupAgencyId,
      returnAgencyId,
      startDate,
      endDate,
    } = createRentalDto;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new BadRequestException(
        'A data de retirada não pode ser no passado.',
      );
    }
    if (end <= start) {
      throw new BadRequestException(
        'A data de devolução deve ser posterior à retirada.',
      );
    }

    const targetReturnId = returnAgencyId || pickupAgencyId;

    const [user, car, pickupAgency, returnAgency] = await Promise.all([
      this.usersService.findOne(userId),
      this.carsService.findOne(carId),
      this.agenciesService.findOne(pickupAgencyId),
      pickupAgencyId === targetReturnId
        ? Promise.resolve(null)
        : this.agenciesService.findOne(targetReturnId),
    ]);

    const finalReturnAgency = returnAgency || pickupAgency;

    if (
      car.status === CarStatus.MAINTENANCE ||
      car.status === CarStatus.RENTED
    ) {
      throw new BadRequestException(
        `Veículo indisponível (Status: ${car.status}). Escolha outro carro.`,
      );
    }

    const conflictingRental = await this.rentalRepository.findOne({
      where: {
        car: { id: carId },
        status: Not(In([RentalStatus.CANCELLED, RentalStatus.COMPLETED])),
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
    });

    if (conflictingRental) {
      throw new ConflictException(
        `Veículo indisponível para este período. Já reservado de ${conflictingRental.startDate.toLocaleDateString()} a ${conflictingRental.endDate.toLocaleDateString()}.`,
      );
    }

    const days = Math.max(1, differenceInDays(end, start));
    let estimatedTotal = Number(car.dailyRate) * days;

    // Taxa de Retorno (30% de uma diária se devolver em outra cidade)
    if (pickupAgency.id !== finalReturnAgency.id) {
      estimatedTotal += Number(car.dailyRate) * 0.3;
    }

    const rental = this.rentalRepository.create({
      user,
      car,
      pickupAgency,
      returnAgency: finalReturnAgency,
      startDate: start,
      endDate: end,
      dailyRateSnapshot: car.dailyRate, // Congela o preço
      totalValue: estimatedTotal,
      status: RentalStatus.CONFIRMED,
      startMileage: createRentalDto.startMileage || car.currentMileage, // Opcional: Ajuste manual na saída
    });

    return await this.rentalRepository.save(rental);
  }

  async findAll(limit = 10, offset = 0) {
    const [results, total] = await this.rentalRepository.findAndCount({
      relations: ['user', 'car', 'pickupAgency', 'returnAgency'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: results,
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const rental = await this.rentalRepository.findOne({
      where: { id },
      relations: ['user', 'car', 'pickupAgency', 'returnAgency'],
    });
    if (!rental) throw new NotFoundException('Reserva não encontrada');
    return rental;
  }
  async update(id: string, updateRentalDto: UpdateRentalDto) {
    const rental = await this.findOne(id);

    if (updateRentalDto.status === RentalStatus.COMPLETED) {
      return this.finalizeRental(rental, updateRentalDto);
    }

    Object.assign(rental, updateRentalDto);
    return this.rentalRepository.save(rental);
  }

  private async finalizeRental(rental: Rental, dto: UpdateRentalDto) {
    if (rental.status === RentalStatus.COMPLETED) {
      throw new BadRequestException('Esta reserva já foi finalizada.');
    }
    if (rental.status === RentalStatus.CANCELLED) {
      throw new BadRequestException(
        'Não é possível finalizar uma reserva cancelada.',
      );
    }
    if (!dto.endMileage) {
      throw new BadRequestException(
        'A quilometragem final é obrigatória na devolução.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { id: rental.car.id },
      });

      if (!car) {
        throw new NotFoundException(
          'Carro vinculado a esta reserva não foi encontrado.',
        );
      }

      const baseStartKm = rental.startMileage || car.currentMileage;

      if (dto.endMileage < baseStartKm) {
        throw new BadRequestException(
          `Erro de Auditoria: KM final (${dto.endMileage}) não pode ser menor que inicial (${baseStartKm}).`,
        );
      }

      await queryRunner.manager.update(Car, car.id, {
        currentMileage: dto.endMileage,
        agency: { id: rental.returnAgency.id },
        status: CarStatus.AVAILABLE,
      });

      const realReturnDate = dto.realReturnDate
        ? new Date(dto.realReturnDate)
        : new Date();
      const actualDays = Math.max(
        1,
        differenceInDays(realReturnDate, rental.startDate),
      );

      let finalTotal = Number(rental.dailyRateSnapshot) * actualDays;

      if (rental.pickupAgency.id !== rental.returnAgency.id) {
        finalTotal += Number(rental.dailyRateSnapshot) * 0.3;
      }

      rental.status = RentalStatus.COMPLETED;
      rental.endMileage = dto.endMileage;
      rental.realReturnDate = realReturnDate;
      rental.totalValue = finalTotal;

      const savedRental = await queryRunner.manager.save(Rental, rental);

      await queryRunner.commitTransaction();
      return savedRental;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new InternalServerErrorException(
        'Erro ao finalizar reserva. Tente novamente.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async checkIn(id: string) {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.CONFIRMED) {
      throw new BadRequestException(
        'Apenas reservas confirmadas podem realizar check-in.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Car, rental.carId, {
        status: CarStatus.RENTED,
      });

      rental.status = RentalStatus.ACTIVE;
      await queryRunner.manager.save(Rental, rental);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const rental = await this.findOne(id);
    if (rental.status === RentalStatus.ACTIVE) {
      throw new BadRequestException(
        'Não é possível excluir um aluguel em andamento.',
      );
    }
    return this.rentalRepository.remove(rental);
  }
}
