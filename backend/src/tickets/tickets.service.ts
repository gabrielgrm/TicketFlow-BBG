import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { TicketStatus, UserRole, Prisma } from '@prisma/client';
import { PaginatedResponse, TicketWithRelations } from '../common/types';
import { ERROR_MESSAGES } from '../common/constants';
import { ticketInclude } from '../common/selectors';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    userRole: UserRole,
  ): Promise<TicketWithRelations> {
    const ticketData: Prisma.TicketCreateInput = {
      title: createTicketDto.title,
      description: createTicketDto.description,
      createdBy: { connect: { id: userId } },
    };

    if (userRole === UserRole.TECH || userRole === UserRole.SUPERVISOR) {
      if (createTicketDto.priority) {
        ticketData.priority = createTicketDto.priority;
      }
      if (createTicketDto.status) {
        ticketData.status = createTicketDto.status;
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: ticketData,
      include: ticketInclude,
    });

    await this.auditLogService.logTicketAction(
      'CREATE',
      ticket.id,
      userId,
      { ticket: { title: ticket.title, description: ticket.description, priority: ticket.priority, status: ticket.status } },
    );

    return ticket;
  }

  async findById(id: string, userId: string, userRole: UserRole): Promise<TicketWithRelations> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET_NOT_FOUND);
    }

    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return ticket;
  }

  async findAll(
    listTicketsDto: ListTicketsDto,
    userId: string,
    userRole: UserRole,
  ): Promise<PaginatedResponse<TicketWithRelations>> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      assignedToId,
    } = listTicketsDto;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.TicketWhereInput = {};

    if (userRole === UserRole.CLIENT) {
      whereClause.createdById = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: ticketInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.ticket.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tickets,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    userId: string,
    userRole: UserRole,
  ): Promise<TicketWithRelations> {
    const ticket = await this.prisma.ticket.findUnique({ 
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET_NOT_FOUND);
    }

    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException(ERROR_MESSAGES.TICKET_ALREADY_DONE);
    }

    if (userRole === UserRole.CLIENT) {
      if (ticket.createdById !== userId) {
        throw new ForbiddenException(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const { title, description } = updateTicketDto;
      
      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data: { title, description },
        include: ticketInclude,
      });

      this.auditLogService.logTicketAction(
        'UPDATE',
        id,
        userId,
        { 
          before: { title: ticket.title, description: ticket.description },
          after: { title, description }
        },
      ).catch(err => console.error('Audit log error:', err));

      return updatedTicket;
    }

    const updateData: Prisma.TicketUpdateInput = {};

    if (updateTicketDto.title !== undefined) {
      updateData.title = updateTicketDto.title;
    }

    if (updateTicketDto.description !== undefined) {
      updateData.description = updateTicketDto.description;
    }

    if (updateTicketDto.status !== undefined) {
      updateData.status = updateTicketDto.status;
    }

    if (updateTicketDto.priority !== undefined) {
      updateData.priority = updateTicketDto.priority;
    }

    if (updateTicketDto.assignedToId !== undefined) {
      if (updateTicketDto.assignedToId === null) {
        updateData.assignedTo = { disconnect: true };
      } else {
        const assignee = await this.prisma.user.findUnique({ 
          where: { id: updateTicketDto.assignedToId } 
        });

        if (!assignee) {
          throw new NotFoundException(ERROR_MESSAGES.ASSIGNEE_NOT_FOUND);
        }

        if (assignee.role !== UserRole.TECH && assignee.role !== UserRole.SUPERVISOR) {
          throw new ForbiddenException(ERROR_MESSAGES.ASSIGNEE_MUST_BE_TECH);
        }

        updateData.assignedTo = { connect: { id: updateTicketDto.assignedToId } };

        if (ticket.assignedToId !== updateTicketDto.assignedToId) {
          this.auditLogService.logTicketAction(
            'ASSIGN',
            id,
            userId,
            {
              before: ticket.assignedToId,
              after: updateTicketDto.assignedToId,
            },
          ).catch(err => console.error('Audit log error:', err));
        }
      }
    }

    if (updateTicketDto.status) {
      if (updateTicketDto.status === TicketStatus.DONE) {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: ticketInclude,
    });

    this.auditLogService.logTicketAction(
      'UPDATE',
      id,
      userId,
      {
        before: {
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assignedToId: ticket.assignedToId,
        },
        after: {
          title: updatedTicket.title,
          description: updatedTicket.description,
          status: updatedTicket.status,
          priority: updatedTicket.priority,
          assignedToId: updatedTicket.assignedToId,
        },
      },
    ).catch(err => console.error('Audit log error:', err));

    return updatedTicket;
  }

  async delete(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET_NOT_FOUND);
    }

    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException(ERROR_MESSAGES.TICKET_ALREADY_DONE);
    }

    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    await this.auditLogService.logTicketAction(
      'DELETE',
      id,
      userId,
      {
        ticket: {
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
        },
      },
    );

    await this.prisma.ticket.delete({ where: { id } });

    return { message: 'Ticket deletado com sucesso' };
  }
}
