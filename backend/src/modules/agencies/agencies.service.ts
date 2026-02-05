import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number) {
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

  async update(id: number, updateAgencyDto: UpdateAgencyDto) {
    const agency = await this.agencyRepository.preload({
      id,
      ...updateAgencyDto,
    });
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return this.agencyRepository.save(agency);
  }

  async remove(id: number) {
    const agency = await this.agencyRepository.findOneBy({ id });
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return this.agencyRepository.remove(agency);
  }
}
