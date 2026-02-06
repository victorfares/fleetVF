import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { Repository, ILike } from 'typeorm';
import { AgenciesService } from '../agencies/agencies.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly agenciesService: AgenciesService,
  ) {}
  async create(createCarDto: CreateCarDto) {
    const { agencyId, ...carData } = createCarDto;
    const agency = await this.agenciesService.findOne(agencyId);
    const car = this.carRepository.create({
      ...carData,
      agency,
    });
    return await this.carRepository.save(car);
  }

  async findAll(paginationDto: PaginationDto, searchTerm?: string) {
    const { limit = 10, offset = 0 } = paginationDto || {};
    const where = searchTerm
      ? [
          { model: ILike(`%${searchTerm}%`) }, // Busca por Modelo
          { brand: ILike(`%${searchTerm}%`) },
        ]
      : {};

    const [results, total] = await this.carRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      relations: ['agency'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: results,
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: number) {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['agency'],
    });

    if (!car) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    return car;
  }

  async update(id: number, updateCarDto: UpdateCarDto) {
    const currentCar = await this.findOne(id);
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

    return this.carRepository.save(carToSave);
  }

  async remove(id: number) {
    const car = await this.findOne(id);
    return this.carRepository.softRemove(car);
  }
}
