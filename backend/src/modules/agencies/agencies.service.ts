import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Agency } from './entities/agency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepository: Repository<Agency>,
  ) {}

  async create(createAgencyDto: CreateAgencyDto) {
    const agency = this.agencyRepository.create(createAgencyDto);

    return this.agencyRepository.save(agency);
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};
    const [results, total] = await this.agencyRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    return {
      data: results,
      count: total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const agency = await this.agencyRepository.findOne({
      where: {
        id,
      },
    });
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto) {
    const agency = await this.agencyRepository.preload({
      id,
      ...updateAgencyDto,
    });
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return this.agencyRepository.save(agency);
  }

  async remove(id: string) {
    const agency = await this.agencyRepository.findOne({
      where: { id },
      relations: ['cars'],
    });
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    if (agency.cars && agency.cars.length > 0) {
      throw new BadRequestException(
        `Não é possível remover a agência "${agency.name}" pois ela possui ${agency.cars.length} carros vinculados. Mova os carros ou delete-os primeiro.`,
      );
    }
    return this.agencyRepository.softRemove(agency);
  }
}
