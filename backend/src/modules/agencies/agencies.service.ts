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
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AgencyResponseDto } from './dto/agency-response.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepository: Repository<Agency>,
    private readonly auditService: AuditService,
  ) {}

  private mapToDto(entity: Agency | Agency[]): any {
    return plainToInstance(AgencyResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(createAgencyDto: CreateAgencyDto, currentUser: User) {
    const agency = this.agencyRepository.create(createAgencyDto);
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logAction(
      currentUser,
      AuditAction.CREATE,
      'Agency',
      savedAgency.id,
      null,
      savedAgency,
    );

    return this.mapToDto(savedAgency);
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};
    const [results, total] = await this.agencyRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    return {
      data: this.mapToDto(results),
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
    return this.mapToDto(agency);
  }

  async update(
    id: string,
    updateAgencyDto: UpdateAgencyDto,
    currentUser: User,
  ) {
    //Busca o estado antigo ANTES de atualizar para salvar na auditoria
    const oldAgency = await this.agencyRepository.findOne({ where: { id } });
    if (!oldAgency) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }

    const agencyToUpdate = await this.agencyRepository.preload({
      id,
      ...updateAgencyDto,
    });

    if (!agencyToUpdate) {
      throw new NotFoundException(`Agência com ID #${id} não encontrada`);
    }

    const savedAgency = await this.agencyRepository.save(agencyToUpdate);

    await this.auditService.logAction(
      currentUser,
      AuditAction.UPDATE,
      'Agency',
      savedAgency.id,
      oldAgency,
      savedAgency,
    );

    return this.mapToDto(savedAgency);
  }

  async remove(id: string, currentUser: User) {
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

    const oldAgency = { ...agency }; // Clone de segurança
    const removedAgency = await this.agencyRepository.softRemove(agency);

    await this.auditService.logAction(
      currentUser,
      AuditAction.DELETE,
      'Agency',
      id,
      oldAgency,
      null,
    );

    return this.mapToDto(removedAgency);
  }
}
