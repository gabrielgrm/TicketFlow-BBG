import { Controller, Get, Query, Param, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { AuditLogService, ListAuditLogsDto } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: ListAuditLogsDto, @Request() req: any) {
    // Apenas SUPERVISOR pode ver todos os logs
    if (req.user.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access audit logs');
    }

    const params: ListAuditLogsDto = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 50,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    return this.auditLogService.findAll(params);
  }

  @Get('ticket/:ticketId')
  async findByTicketId(@Param('ticketId') ticketId: string, @Request() req: any) {
    // TECH e SUPERVISOR podem ver logs de tickets
    if (req.user.role === UserRole.CLIENT) {
      throw new ForbiddenException('Clients cannot access audit logs');
    }

    return this.auditLogService.findByTicketId(ticketId);
  }
}
