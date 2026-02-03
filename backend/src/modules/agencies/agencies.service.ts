import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const agency = this.agencies.find((item) => item.id === +id);
    if (!agency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return agency;
  }

  update(id: number, updateAgencyDto: UpdateAgencyDto) {
    const existingAgencyIndex = this.agencies.findIndex(
      (item) => item.id === id,
    );
    if (existingAgencyIndex < 0) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    const agency = this.agencies[existingAgencyIndex];
    this.agencies[existingAgencyIndex] = {
      ...agency,
      ...updateAgencyDto,
    };

    return this.agencies[existingAgencyIndex];
  }

  remove(id: number) {
    const existingAgencyIndex = this.agencies.findIndex(
      (item) => item.id === id,
    );
    if (existingAgencyIndex < 0) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }
    return `This action removes a #${id} agency`;
  }
}
