import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog } from '@prisma/client';

export interface CreateAuditLogDto {
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  userId: string;
  metadata?: any;
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
    return this.prisma.auditLog.create({
      data: createAuditLogDto,
    });
  }

  async findAll(params: ListAuditLogsDto): Promise<PaginatedAuditLogs> {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      entityId,
      userId,
      dateFrom,
      dateTo,
    } = params;

    const skip = (page - 1) * limit;
    const whereClause: any = {};

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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Helper para registrar ações de ticket
  async logTicketAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN',
    ticketId: string,
    userId: string,
    changes?: any,
    metadata?: any,
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

  // Helper para registrar ações de comentário
  async logCommentAction(
    action: 'COMMENT_ADD' | 'COMMENT_DELETE',
    commentId: string,
    ticketId: string,
    userId: string,
    metadata?: any,
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
