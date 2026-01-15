import { Controller, Get, Query, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuditLogService, ListAuditLogsDto } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { RequestUser } from '../common/types';
import { ERROR_MESSAGES } from '../common/constants';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: ListAuditLogsDto, @CurrentUser() user: RequestUser) {
    if (user.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException(ERROR_MESSAGES.ONLY_SUPERVISORS);
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
  async findByTicketId(@Param('ticketId') ticketId: string, @CurrentUser() user: RequestUser) {
    if (user.role === UserRole.CLIENT) {
      throw new ForbiddenException(ERROR_MESSAGES.CLIENTS_CANNOT_ACCESS_LOGS);
    }

    return this.auditLogService.findByTicketId(ticketId);
  }
}
