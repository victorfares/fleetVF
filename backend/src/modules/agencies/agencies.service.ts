import { Injectable } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Agency } from './entities/agency.entity';

@Injectable()
export class AgenciesService {
  private lastId = 1;
  private agencies: Agency[] = [];
  create(createAgencyDto: CreateAgencyDto) {
    const newAgency: Agency = {
      id: this.agencies.length + 1,
      ...createAgencyDto,
      createdAt: new Date(),
    };
    this.agencies.push(newAgency);
    return newAgency;
  }

  findAll() {
    return this.agencies;
  }

  findOne(id: number) {
    return this.agencies.find((item) => item.id === +id);
  }

  update(id: number, updateAgencyDto: UpdateAgencyDto) {
    return `This action updates a #${id} agency`;
  }

  remove(id: number) {
    return `This action removes a #${id} agency`;
  }
}
