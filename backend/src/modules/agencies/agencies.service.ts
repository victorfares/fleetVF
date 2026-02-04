import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Agency } from './entities/agency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepository: Repository<Agency>,
  ) {}
  private lastId = 1;
  private agencies: Agency[] = [];

  async create(createAgencyDto: CreateAgencyDto) {
    const agency = this.agencyRepository.create(createAgencyDto);

    return this.agencyRepository.save(agency);
  }

  async findAll() {
    const agencies = await this.agencyRepository.find();
    return agencies;
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
