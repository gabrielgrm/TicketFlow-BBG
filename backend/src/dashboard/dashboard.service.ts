import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Tickets abertos hoje
    const openToday = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    });

    // Tickets pendentes (OPEN + IN_PROGRESS)
    const totalPending = await this.prisma.ticket.count({
      where: {
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    });

    // Tickets resolvidos hoje
    const resolvedToday = await this.prisma.ticket.count({
      where: {
        status: TicketStatus.DONE,
        updatedAt: {
          gte: todayStart,
        },
      },
    });

    // Urgências pendentes (URGENT sem técnico ou abertos)
    const urgentPending = await this.prisma.ticket.count({
      where: {
        priority: TicketPriority.URGENT,
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    });

    // Tickets sem atribuição
    const unassigned = await this.prisma.ticket.count({
      where: {
        assignedToId: null,
        status: {
          not: TicketStatus.DONE,
        },
      },
    });

    // Tickets atrasados (abertos há mais de 48h sem progresso)
    const overdueTickets = await this.prisma.ticket.count({
      where: {
        createdAt: {
          lt: twoDaysAgo,
        },
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    });

    // Taxa de resolução (% de tickets fechados vs abertos no mês)
    const createdThisMonth = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    });

    const resolvedThisMonth = await this.prisma.ticket.count({
      where: {
        status: TicketStatus.DONE,
        updatedAt: {
          gte: monthStart,
        },
      },
    });

    const resolutionRate = createdThisMonth > 0 
      ? (resolvedThisMonth / createdThisMonth) * 100 
      : 0;

    // Tempo médio de resposta (média entre criação e primeira atribuição)
    const assignedTickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let avgResponseTime = '0h 0min';
    if (assignedTickets.length > 0) {
      const totalMinutes = assignedTickets.reduce((sum, ticket) => {
        const diff = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
        return sum + diff / (1000 * 60);
      }, 0);

      const avgMinutes = Math.floor(totalMinutes / assignedTickets.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgResponseTime = `${hours}h ${minutes}min`;
    }

    return {
      openToday,
      totalPending,
      resolvedToday,
      avgResponseTime,
      urgentPending,
      unassigned,
      overdueTickets,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
    };
  }

  async getChartTrends(days: number = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const labels: string[] = [];
    const created: number[] = [];
    const resolved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // Formatar label (DD/MM)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      // Contar tickets criados
      const createdCount = await this.prisma.ticket.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });
      created.push(createdCount);

      // Contar tickets resolvidos
      const resolvedCount = await this.prisma.ticket.count({
        where: {
          status: TicketStatus.DONE,
          updatedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });
      resolved.push(resolvedCount);
    }

    return {
      labels,
      created,
      resolved,
    };
  }

  async getChartPriority() {
    const priorities = await this.prisma.ticket.groupBy({
      by: ['priority'],
      _count: {
        priority: true,
      },
      where: {
        status: {
          not: TicketStatus.DONE,
        },
      },
    });

    const result: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    priorities.forEach((p) => {
      if (p.priority) {
        result[p.priority] = p._count.priority;
      }
    });

    return result;
  }

  async getTechnicians() {
    const technicians = await this.prisma.user.findMany({
      where: {
        role: 'TECH',
      },
      select: {
        id: true,
        name: true,
      },
    });

    const result = await Promise.all(
      technicians.map(async (tech) => {
        // Tickets atribuídos
        const assigned = await this.prisma.ticket.count({
          where: {
            assignedToId: tech.id,
            status: {
              not: TicketStatus.DONE,
            },
          },
        });

        // Tickets resolvidos
        const resolved = await this.prisma.ticket.count({
          where: {
            assignedToId: tech.id,
            status: TicketStatus.DONE,
          },
        });

        // Tempo médio de resolução
        const resolvedTickets = await this.prisma.ticket.findMany({
          where: {
            assignedToId: tech.id,
            status: TicketStatus.DONE,
            resolvedAt: {
              not: null,
            },
          },
          select: {
            createdAt: true,
            resolvedAt: true,
          },
        });

        let avgTime = '0h 0min';
        if (resolvedTickets.length > 0) {
          const totalMinutes = resolvedTickets.reduce((sum, ticket) => {
            if (ticket.resolvedAt) {
              const diff = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
              return sum + diff / (1000 * 60);
            }
            return sum;
          }, 0);

          const avgMinutes = Math.floor(totalMinutes / resolvedTickets.length);
          const hours = Math.floor(avgMinutes / 60);
          const minutes = avgMinutes % 60;
          avgTime = `${hours}h ${minutes}min`;
        }

        return {
          id: tech.id,
          name: tech.name,
          assigned,
          resolved,
          avgTime,
        };
      }),
    );

    return result;
  }

  async getCriticalTickets() {
    return this.prisma.ticket.findMany({
      where: {
        priority: {
          in: [TicketPriority.URGENT, TicketPriority.HIGH],
        },
        status: {
          not: TicketStatus.DONE,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getRecentActions(limit: number = 10) {
    return this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
