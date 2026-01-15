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
import { Ticket, TicketStatus, UserRole } from '@prisma/client';

const baseUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const ticketInclude = {
  createdBy: { select: baseUserSelect },
  assignedTo: { select: baseUserSelect },
  comments: {
    include: {
      user: { select: baseUserSelect },
    },
  },
} as const;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
  ): Promise<Ticket> {
    const ticketData: any = {
      title: createTicketDto.title,
      description: createTicketDto.description,
      createdById: userId,
    };

    // Only technicians can set priority or status on creation
    if (userRole === UserRole.TECH) {
      if (createTicketDto.priority) {
        ticketData.priority = createTicketDto.priority;
      }
      if (createTicketDto.status) {
        ticketData.status = createTicketDto.status;
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: ticketData,
      include: {
        createdBy: { select: baseUserSelect },
        assignedTo: { select: baseUserSelect },
        comments: {
          include: {
            user: { select: baseUserSelect },
          },
        },
      },
    });

    // Log da criação
    await this.auditLogService.logTicketAction(
      'CREATE',
      ticket.id,
      userId,
      { ticket: ticketData },
    );

    return ticket;
  }

  async findById(id: string, userId: string, userRole: UserRole): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: baseUserSelect },
        assignedTo: { select: baseUserSelect },
        comments: {
          include: {
            user: { select: baseUserSelect },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este ticket');
    }

    return ticket;
  }

  async findAll(
    listTicketsDto: ListTicketsDto,
    userId: string,
    userRole: UserRole,
  ): Promise<PaginatedResponse<Ticket>> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      assignedToId,
    } = listTicketsDto;

    const skip = (page - 1) * limit;

    // Build where clause based on role
    const whereClause: any = {};

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
          include: {
            createdBy: { select: baseUserSelect },
            assignedTo: { select: baseUserSelect },
            comments: {
              include: {
                user: { select: baseUserSelect },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.ticket.count({ where: whereClause }),
      ]);    const totalPages = Math.ceil(total / limit);

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
  ): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({ 
      where: { id },
      include: {
        createdBy: { select: baseUserSelect },
        assignedTo: { select: baseUserSelect },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Check if ticket is DONE
    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException('Não é possível editar um ticket com status CONCLUÍDO');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT) {
      if (ticket.createdById !== userId) {
        throw new ForbiddenException('Você não tem permissão para editar este ticket');
      }
      // CLIENT can only edit title and description
      const { title, description } = updateTicketDto;
      
      const beforeData = { title: ticket.title, description: ticket.description };
      const afterData = { title, description };
      
      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data: { title, description },
        include: {
          createdBy: { select: baseUserSelect },
          assignedTo: { select: baseUserSelect },
          comments: {
            include: {
              user: { select: baseUserSelect },
            },
          },
        },
      });

      // Log da atualização - sem await para não bloquear resposta
      this.auditLogService.logTicketAction(
        'UPDATE',
        id,
        userId,
        { before: beforeData, after: afterData },
      ).catch(err => console.error('Audit log error:', err));

      return updatedTicket;
    }

    // TECH can edit everything
    const beforeData = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedToId: ticket.assignedToId,
    };

    const updateData: any = { ...updateTicketDto };

    // Ensure assignee exists and is a TECH if provided
    if (updateTicketDto.assignedToId) {
      const assignee = await this.prisma.user.findUnique({ where: { id: updateTicketDto.assignedToId } });

      if (!assignee) {
        throw new NotFoundException('Usuário atribuído não encontrado');
      }

      if (assignee.role !== UserRole.TECH && assignee.role !== UserRole.SUPERVISOR) {
        throw new ForbiddenException('Apenas usuários TECH podem ser atribuídos a tickets');
      }

      // Log especial para atribuição - sem await para não bloquear resposta
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

    // Handle resolvedAt based on status change
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
      include: {
        createdBy: { select: baseUserSelect },
        assignedTo: { select: baseUserSelect },
        comments: {
          include: {
            user: { select: baseUserSelect },
          },
        },
      },
    });

    // Log da atualização geral - sem await para não bloquear resposta
    this.auditLogService.logTicketAction(
      'UPDATE',
      id,
      userId,
      {
        before: beforeData,
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
      throw new NotFoundException('Ticket não encontrado');
    }

    // Check if ticket is DONE
    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException('Não é possível deletar um ticket com status DONE');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este ticket');
    }

    // Log antes de deletar
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

    return { message: 'Ticket deleted successfully' };
  }
}
