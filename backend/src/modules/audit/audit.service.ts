import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';
import { AuditAction } from './enums/audit-action.enum';
import { User } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { AuditResponseDto } from './dto/audit-response.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    user: User | null,
    action: AuditAction,
    entityName: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
  ) {
    const log = this.auditRepository.create({
      userId: user?.id || null,
      userEmail: user?.email || 'Sistema',
      action,
      entityName,
      entityId,
      oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
      newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
    });

    return await this.auditRepository.save(log);
  }

  async findAll() {
    const logs = await this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return plainToInstance(AuditResponseDto, logs, {
      excludeExtraneousValues: true,
    });
  }
}
