import { Exclude, Expose } from 'class-transformer';
import { AuditAction } from '../enums/audit-action.enum';

@Exclude()
export class AuditResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  userEmail: string;

  @Expose()
  action: AuditAction;

  @Expose()
  entityName: string;

  @Expose()
  entityId: string;

  @Expose()
  oldValues: Record<string, any>;

  @Expose()
  newValues: Record<string, any>;

  @Expose()
  createdAt: Date;
}