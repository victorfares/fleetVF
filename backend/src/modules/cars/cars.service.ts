import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { AgenciesService } from '../agencies/agencies.service';
import { FindCarsDto } from './dto/find-cars.dto';
import { CarResponseDto } from './dto/car-response.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly agenciesService: AgenciesService,
    private readonly auditService: AuditService,
  ) {}

  private mapToDto(entity: Car | Car[]): any {
    return plainToInstance(CarResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  // Recebe o usuário logado como parâmetro
  async create(createCarDto: CreateCarDto, currentUser: User) {
    const { agencyId, ...carData } = createCarDto;
    const agency = await this.agenciesService.findOne(agencyId);

    const car = this.carRepository.create({
      ...carData,
      agency,
    });

    const savedCar = await this.carRepository.save(car);

    await this.auditService.logAction(
      currentUser,
      AuditAction.CREATE,
      'Car',
      savedCar.id,
      null,
      savedCar,
    );

    return this.mapToDto(savedCar);
  }

  async findAll(findCarsDto: FindCarsDto) {
    const { limit = 10, offset = 0, search, agencyId } = findCarsDto;

    let where: FindOptionsWhere<Car> | FindOptionsWhere<Car>[] = {};

    if (search) {
      where = [
        { model: ILike(`%${search}%`) },
        { brand: ILike(`%${search}%`) },
      ];
    }

    if (agencyId) {
      if (Array.isArray(where)) {
        where = where.map((condition) => ({
          ...condition,
          agency: { id: agencyId },
        }));
      } else {
        where = { agency: { id: agencyId } };
      }
    }

    const [results, total] = await this.carRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      relations: ['agency'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.mapToDto(results),
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['agency'],
    });

    if (!car) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    return this.mapToDto(car);
  }

  // Recebe o usuário logado
  async update(id: string, updateCarDto: UpdateCarDto, currentUser: User) {
    // 1. Guarda o estado ANTIGO do carro antes de alterar
    const currentCar = await this.carRepository.findOne({
      where: { id },
      relations: ['agency'],
    });

    if (!currentCar) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    if (
      updateCarDto.currentMileage !== undefined &&
      updateCarDto.currentMileage < currentCar.currentMileage
    ) {
      throw new BadRequestException(
        `A quilometragem não pode ser reduzida. Atual: ${currentCar.currentMileage}, Tentativa: ${updateCarDto.currentMileage}`,
      );
    }

    if (updateCarDto.agencyId) {
      await this.agenciesService.findOne(updateCarDto.agencyId);
    }

    const { agencyId, licensePlate, ...data } = updateCarDto as any;

    const carToSave = await this.carRepository.preload({
      id,
      ...data,
      agency: agencyId ? { id: agencyId } : undefined,
    });

    if (!carToSave) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    const savedCar = await this.carRepository.save(carToSave);

    await this.auditService.logAction(
      currentUser,
      AuditAction.UPDATE,
      'Car',
      savedCar.id,
      currentCar,
      savedCar,
    );

    return this.mapToDto(savedCar);
  }

  async remove(id: string, currentUser: User) {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    await this.carRepository.softRemove(car);

    await this.auditService.logAction(
      currentUser,
      AuditAction.DELETE,
      'Car',
      car.id,
      car,
      null,
    );

    return { message: 'Carro removido com sucesso' };
  }
}
