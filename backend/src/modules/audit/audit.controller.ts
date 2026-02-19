import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { AuditResponseDto } from './dto/audit-response.dto';

@ApiTags('Audit Logs')
@Controller('audit')
@ApiBearerAuth('access-token')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lista os últimos logs de auditoria do sistema' })
  @ApiResponse({ status: 200, type: [AuditResponseDto] })
  findAll(): Promise<AuditResponseDto[]> {
    return this.auditService.findAll();
  }
}