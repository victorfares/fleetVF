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
import { Repository } from 'typeorm';
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
    try {
      const { agencyId, ...carData } = createCarDto;
      const agency = await this.agenciesService.findOne(agencyId);
      const car = this.carRepository.create({
        ...carData,
        agency,
      });
      return await this.carRepository.save(car);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Já existe um veículo cadastrado com esta placa',
        );
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    const [results, total] = await this.carRepository.findAndCount({
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
    const carNoBanco = await this.findOne(id);
    if (updateCarDto.agencyId) {
      await this.agenciesService.findOne(updateCarDto.agencyId);
    }
    if (
      updateCarDto.currentMileage !== undefined &&
      updateCarDto.currentMileage < carNoBanco.currentMileage
    ) {
      throw new BadRequestException(
        `A quilometragem não pode ser reduzida. Atual: ${carNoBanco.currentMileage}, Tentativa: ${updateCarDto.currentMileage}`,
      );
    }
    const { agencyId, ...data } = updateCarDto;
    if ('licensePlate' in data) {
      delete data['licensePlate'];
    }
    const dataToUpdate: any = {
      id,
      ...data,
    };
    if (agencyId) {
      dataToUpdate.agency = { id: agencyId };
    }
    const carToSave = await this.carRepository.preload(dataToUpdate);
    if (!carToSave) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }

    return this.carRepository.save(carToSave);
  }

  async remove(id: number) {
    const car = await this.findOne(id);
    return this.carRepository.remove(car);
  }
}
