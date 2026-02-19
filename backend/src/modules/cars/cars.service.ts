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

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly agenciesService: AgenciesService,
  ) {}

  private mapToDto(entity: Car | Car[]): any {
    return plainToInstance(CarResponseDto, entity, {
      excludeExtraneousValues: true, // Só retorna o que tiver @Expose no DTO
    });
  }
  async create(createCarDto: CreateCarDto) {
    const { agencyId, ...carData } = createCarDto;
    const agency = await this.agenciesService.findOne(agencyId);
    const car = this.carRepository.create({
      ...carData,
      agency,
    });
    const savedCar = await this.carRepository.save(car);
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
        // Se não tem busca textual, é apenas um filtro simples
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

  async update(id: string, updateCarDto: UpdateCarDto) {
    const currentCar = await this.carRepository.findOne({ where: { id } });
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
    return this.mapToDto(savedCar);
  }

  async remove(id: string) {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Carro com ID #${id} não encontrado`);
    }
    await this.carRepository.softRemove(car);
    return { message: 'Carro removido com sucesso' };
  }
}
