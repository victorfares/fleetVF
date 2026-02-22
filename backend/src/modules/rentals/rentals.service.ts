import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  In,
  Brackets,
} from 'typeorm';
import { differenceInDays } from 'date-fns';

import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { Rental } from './entities/rental.entity';

import { CarStatus } from '../cars/enums/car-status.enum';
import { Car } from '../cars/entities/car.entity';
import { RentalStatus } from './enums/rental-status.enum';
import { User } from '../users/entities/user.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { FindRentalsDto } from './dto/find-rentals.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/enums/audit-action.enum';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService, // Injetando o serviço de auditoria
  ) {}

  async create(createRentalDto: CreateRentalDto, currentUser: User) {
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const targetReturnId = returnAgencyId || pickupAgencyId;

      const user = await manager.findOneBy(User, { id: userId });
      if (!user)
        throw new NotFoundException(
          `Usuário com ID #${userId} não encontrado.`,
        );

      const car = await manager.findOne(Car, {
        where: { id: carId },
        relations: ['agency'],
      });
      if (!car)
        throw new NotFoundException(`Carro com ID #${carId} não encontrado.`);
      const pickupAgency = await manager.findOneBy(Agency, {
        id: pickupAgencyId,
      });
      if (!pickupAgency)
        throw new NotFoundException(
          `Agência de retirada com ID #${pickupAgencyId} não encontrada.`,
        );
      if (car.agency.id !== pickupAgencyId) {
        throw new BadRequestException(
          `O veículo selecionado encontra-se fisicamente em outra agência. Escolha um veículo disponível na agência de retirada desejada.`,
        );
      }

      const returnAgency =
        targetReturnId === pickupAgencyId
          ? pickupAgency
          : await manager.findOneBy(Agency, { id: targetReturnId });
      if (!returnAgency)
        throw new NotFoundException(
          `Agência de devolução com ID #${targetReturnId} não encontrada.`,
        );

      const conflictingRental = await manager.findOne(Rental, {
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

      if (pickupAgency.id !== returnAgency.id) {
        estimatedTotal += Number(car.dailyRate) * 0.3;
      }

      const rental = manager.create(Rental, {
        user,
        car,
        pickupAgency,
        returnAgency,
        startDate: start,
        endDate: end,
        dailyRateSnapshot: car.dailyRate,
        totalValue: estimatedTotal,
        status: RentalStatus.CONFIRMED,
        startMileage: createRentalDto.startMileage || car.currentMileage,
      });

      const savedRental = await manager.save(rental);
      await queryRunner.commitTransaction();

      await this.auditService.logAction(
        currentUser,
        AuditAction.CREATE,
        'Rental',
        savedRental.id,
        null,
        savedRental,
      );

      return savedRental;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Erro ao criar a reserva.', err);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(dto: FindRentalsDto, currentUser: User) {
    const {
      limit,
      offset,
      status,
      userId,
      orderBy = 'createdAt',
      orderDirection,
      startDateMin,
      startDateMax,
      search,
    } = dto;

    const query = this.rentalRepository.createQueryBuilder('rental');

    query.leftJoinAndSelect('rental.user', 'user');
    query.leftJoinAndSelect('rental.car', 'car');
    query.leftJoinAndSelect('rental.pickupAgency', 'pickupAgency');
    query.leftJoinAndSelect('rental.returnAgency', 'returnAgency');

    const isAdminOrManager =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER;

    if (!isAdminOrManager) {
      query.andWhere('rental.userId = :currentUserId', {
        currentUserId: currentUser.id,
      });
    } else {
      if (userId) {
        query.andWhere('rental.userId = :userId', { userId });
      }
    }

    if (status) {
      query.andWhere('rental.status = :status', { status });
    }

    if (startDateMin) {
      query.andWhere('rental.startDate >= :startDateMin', { startDateMin });
    }
    if (startDateMax) {
      query.andWhere('rental.startDate <= :startDateMax', { startDateMax });
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` })
            .orWhere('car.model ILIKE :search', { search: `%${search}%` })
            .orWhere('car.licensePlate ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const allowedSortFields = [
      'createdAt',
      'startDate',
      'endDate',
      'totalValue',
      'status',
    ];

    const sortField = allowedSortFields.includes(orderBy)
      ? `rental.${orderBy}`
      : 'rental.createdAt';

    query.orderBy(sortField, orderDirection || 'DESC');
    query.take(limit);
    query.skip(offset);

    const [results, total] = await query.getManyAndCount();

    return {
      data: results,
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: string, currentUser?: User) {
    const rental = await this.rentalRepository.findOne({
      where: { id },
      relations: ['user', 'car', 'pickupAgency', 'returnAgency'],
    });

    if (!rental) throw new NotFoundException('Reserva não encontrada');

    if (currentUser) {
      const isAdminOrManager =
        currentUser.role === UserRole.ADMIN ||
        currentUser.role === UserRole.MANAGER;

      if (!isAdminOrManager && rental.user.id !== currentUser.id) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar esta reserva.',
        );
      }
    }

    return rental;
  }

  async update(
    id: string,
    updateRentalDto: UpdateRentalDto,
    currentUser: User,
  ) {
    const rental = await this.findOne(id);

    if (
      updateRentalDto.startDate ||
      updateRentalDto.endDate ||
      updateRentalDto.carId
    ) {
      throw new BadRequestException(
        'Para alterar datas ou o veículo, cancele esta reserva e crie uma nova.',
      );
    }

    if (updateRentalDto.status === RentalStatus.COMPLETED) {
      return this.finalizeRental(rental, updateRentalDto, currentUser);
    }

    const oldRental = { ...rental };

    Object.assign(rental, updateRentalDto);
    const savedRental = await this.rentalRepository.save(rental);

    await this.auditService.logAction(
      currentUser,
      AuditAction.UPDATE,
      'Rental',
      savedRental.id,
      oldRental,
      savedRental,
    );

    return savedRental;
  }

  private async finalizeRental(
    rental: Rental,
    dto: UpdateRentalDto,
    currentUser: User,
  ) {
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

    const oldRental = { ...rental };
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

      const savedRental = await queryRunner.manager.save(rental);

      await queryRunner.commitTransaction();

      await this.auditService.logAction(
        currentUser,
        AuditAction.FINALIZE,
        'Rental',
        savedRental.id,
        oldRental,
        savedRental,
      );

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

  async checkIn(id: string, currentUser: User) {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.CONFIRMED) {
      throw new BadRequestException(
        'Apenas reservas confirmadas podem realizar check-in.',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rentalStart = new Date(rental.startDate);
    rentalStart.setHours(0, 0, 0, 0);

    if (today < rentalStart) {
      throw new BadRequestException(
        `O check-in só pode ser realizado a partir da data de retirada (${rentalStart.toLocaleDateString()}).`,
      );
    }

    if (rental.car.status !== CarStatus.AVAILABLE) {
      throw new BadRequestException(
        `Não é possível realizar o check-in. O veículo físico encontra-se indisponível no momento (Status atual: ${rental.car.status}).`,
      );
    }

    const oldRental = { ...rental };
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Car, rental.car.id, {
        status: CarStatus.RENTED,
      });

      rental.status = RentalStatus.ACTIVE;
      await queryRunner.manager.save(rental);
      rental.startMileage = rental.car.currentMileage;

      await queryRunner.commitTransaction();

      const savedRental = await this.findOne(rental.id);

      await this.auditService.logAction(
        currentUser,
        AuditAction.CHECK_IN,
        'Rental',
        savedRental.id,
        oldRental,
        savedRental,
      );

      return savedRental;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Falha ao realizar check-in.',
        err,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, currentUser: User) {
    const rental = await this.findOne(id);
    if (rental.status === RentalStatus.ACTIVE) {
      throw new BadRequestException(
        'Não é possível excluir um aluguel em andamento.',
      );
    }

    const oldRental = { ...rental };
    await this.rentalRepository.remove(rental);

    await this.auditService.logAction(
      currentUser,
      AuditAction.DELETE,
      'Rental',
      id,
      oldRental,
      null,
    );

    return { message: 'Reserva removida com sucesso' };
  }

  async cancel(id: string, currentUser: User) {
    const rental = await this.findOne(id);

    if (rental.status !== RentalStatus.CONFIRMED) {
      throw new BadRequestException(
        `Não é possível cancelar uma reserva com status ${rental.status}. Apenas reservas CONFIRMED podem ser canceladas.`,
      );
    }

    const oldRental = { ...rental };

    await this.rentalRepository.update(id, {
      status: RentalStatus.CANCELLED,
    });
    const savedRental = await this.findOne(id);
    await this.auditService.logAction(
      currentUser,
      AuditAction.UPDATE,
      'Rental',
      savedRental.id,
      oldRental,
      savedRental,
    );

    return savedRental;
  }
}
