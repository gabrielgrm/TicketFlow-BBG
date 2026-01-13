import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

interface PaginatedResponse<T> {
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
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.ticket.create({
      data: ticketData,
      include: ticketInclude,
    });
  }

  async findById(id: string, userId: string, userRole: UserRole): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to access this ticket');
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
        },
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
  ): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if ticket is DONE
    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException('Cannot edit a ticket with status DONE');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT) {
      if (ticket.createdById !== userId) {
        throw new ForbiddenException('You do not have permission to edit this ticket');
      }
      // CLIENT can only edit title and description
      const { title, description } = updateTicketDto;
      return this.prisma.ticket.update({
        where: { id },
        data: { title, description },
        include: ticketInclude,
      });
    }

    // TECH can edit everything
    const updateData: any = { ...updateTicketDto };

    // Ensure assignee exists and is a TECH if provided
    if (updateTicketDto.assignedToId) {
      const assignee = await this.prisma.user.findUnique({ where: { id: updateTicketDto.assignedToId } });

      if (!assignee) {
        throw new NotFoundException('Assigned user not found');
      }

      if (assignee.role !== UserRole.TECH) {
        throw new ForbiddenException('Only TECH users can be assigned to tickets');
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

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: ticketInclude,
    });
  }

  async delete(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if ticket is DONE
    if (ticket.status === TicketStatus.DONE) {
      throw new ConflictException('Cannot delete a ticket with status DONE');
    }

    // Check authorization
    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this ticket');
    }

    await this.prisma.ticket.delete({ where: { id } });

    return { message: 'Ticket deleted successfully' };
  }
}
