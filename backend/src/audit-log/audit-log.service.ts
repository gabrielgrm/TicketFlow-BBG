import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog, Prisma } from '@prisma/client';
import { safeUserSelect } from '../common/selectors';
import { PAGINATION } from '../common/constants';

export interface CreateAuditLogDto {
  action: string;
  entityType: string;
  entityId: string;
  changes?: Prisma.InputJsonValue;
  userId: string;
  metadata?: Prisma.InputJsonValue;
}

export interface ListAuditLogsDto {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const { userId, ...rest } = createAuditLogDto;
    return this.prisma.auditLog.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(params: ListAuditLogsDto): Promise<PaginatedAuditLogs> {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_AUDIT_LIMIT,
      action,
      entityType,
      entityId,
      userId,
      dateFrom,
      dateTo,
    } = params;

    const skip = (page - 1) * limit;
    const whereClause: Prisma.AuditLogWhereInput = {};

    if (action) whereClause.action = action;
    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (userId) whereClause.userId = userId;
    
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: { select: safeUserSelect },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.auditLog.count({ where: whereClause }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTicketId(ticketId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: 'TICKET',
        entityId: ticketId,
      },
      include: {
        user: { select: safeUserSelect },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async logTicketAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN',
    ticketId: string,
    userId: string,
    changes?: Prisma.InputJsonValue,
    metadata?: Prisma.InputJsonValue,
  ): Promise<AuditLog> {
    return this.create({
      action,
      entityType: 'TICKET',
      entityId: ticketId,
      changes,
      userId,
      metadata,
    });
  }

  async logCommentAction(
    action: 'COMMENT_ADD' | 'COMMENT_DELETE',
    commentId: string,
    ticketId: string,
    userId: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<AuditLog> {
    return this.create({
      action,
      entityType: 'COMMENT',
      entityId: commentId,
      changes: { ticketId },
      userId,
      metadata,
    });
  }
}
