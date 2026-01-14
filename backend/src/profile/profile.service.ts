import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyMetrics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.calculateTechMetrics(userId);
  }

  async getTechProfile(techId: string) {
    const tech = await this.prisma.user.findUnique({
      where: { id: techId },
    });

    if (!tech) {
      throw new NotFoundException('Técnico não encontrado');
    }

    return this.calculateTechMetrics(techId);
  }

  private async calculateTechMetrics(techId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tickets atribuídos atualmente (não resolvidos)
    const assignedTickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: techId,
        status: {
          not: TicketStatus.DONE,
        },
      },
      select: {
        id: true,
        priority: true,
      },
    });

    const assignedCount = assignedTickets.length;

    // Resolvidos este mês
    const resolvedThisMonth = await this.prisma.ticket.findMany({
      where: {
        assignedToId: techId,
        status: TicketStatus.DONE,
        updatedAt: {
          gte: monthStart,
        },
      },
      select: {
        id: true,
        priority: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const resolvedCount = resolvedThisMonth.length;

    // Tempo médio de resposta (entre atribuição/criação e primeira ação)
    const assignedWithComments = await this.prisma.ticket.findMany({
      where: {
        assignedToId: techId,
      },
      include: {
        comments: {
          where: {
            userId: techId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
      },
    });

    let avgResponseTime = '0h 0min';
    if (assignedWithComments.filter((t) => t.comments.length > 0).length > 0) {
      const responseTimes = assignedWithComments
        .filter((t) => t.comments.length > 0)
        .map((t) => {
          const diff = t.comments[0].createdAt.getTime() - t.createdAt.getTime();
          return diff / (1000 * 60); // em minutos
        });

      const avgMinutes = Math.floor(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      );
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgResponseTime = `${hours}h ${minutes}min`;
    }

    // Taxa de resolução (resolvidos/atribuídos)
    const allAssigned = await this.prisma.ticket.count({
      where: {
        assignedToId: techId,
      },
    });

    const resolutionRate =
      allAssigned > 0 ? ((resolvedCount / allAssigned) * 100).toFixed(1) : '0.0';

    // Prioridade média resolvida (HIGH/URGENT vs LOW/MEDIUM)
    const highPriorityResolved = resolvedThisMonth.filter(
      (t) => t.priority === TicketPriority.HIGH || t.priority === TicketPriority.URGENT,
    ).length;

    const lowPriorityResolved = resolvedThisMonth.filter(
      (t) => t.priority === TicketPriority.LOW || t.priority === TicketPriority.MEDIUM,
    ).length;

    // Histórico: últimos 10 tickets resolvidos
    const lastResolvedTickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: techId,
        status: TicketStatus.DONE,
      },
      orderBy: {
        resolvedAt: 'desc',
      },
      take: 10,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        comments: {
          where: {
            userId: {
              not: techId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const history = lastResolvedTickets.map((ticket) => {
      const timeSpent =
        ticket.resolvedAt && ticket.createdAt
          ? Math.floor((ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60))
          : 0;

      return {
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        resolvedAt: ticket.resolvedAt,
        timeSpentHours: timeSpent,
        clientFeedback: ticket.comments[0]?.content || null,
      };
    });

    // Dados para gráfico de linha (últimos 30 dias)
    const resolvedLast30Days = await this.getResolvedTrendData(techId, 30);

    // Dados para pizza (prioridades resolvidas)
    const priorityDistribution = await this.getPriorityDistribution(techId);

    // Comparação com outros técnicos
    const teamComparison = await this.getTeamComparison(techId);

    return {
      metrics: {
        assignedCount,
        resolvedThisMonth: resolvedCount,
        avgResponseTime,
        resolutionRate: parseFloat(resolutionRate),
        highPriorityResolved,
        lowPriorityResolved,
      },
      charts: {
        resolvedTrend: resolvedLast30Days,
        priorityDistribution,
        teamComparison,
      },
      history,
    };
  }

  private async getResolvedTrendData(techId: string, days: number) {
    const now = new Date();
    const labels: string[] = [];
    const resolved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      const count = await this.prisma.ticket.count({
        where: {
          assignedToId: techId,
          status: TicketStatus.DONE,
          resolvedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      resolved.push(count);
    }

    return { labels, resolved };
  }

  private async getPriorityDistribution(techId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const priorities = await this.prisma.ticket.groupBy({
      by: ['priority'],
      _count: {
        priority: true,
      },
      where: {
        assignedToId: techId,
        status: TicketStatus.DONE,
        updatedAt: {
          gte: monthStart,
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

  private async getTeamComparison(currentTechId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const techs = await this.prisma.user.findMany({
      where: {
        role: 'TECH',
      },
      select: {
        id: true,
        name: true,
      },
    });

    const comparison = await Promise.all(
      techs.map(async (tech) => {
        const resolved = await this.prisma.ticket.count({
          where: {
            assignedToId: tech.id,
            status: TicketStatus.DONE,
            updatedAt: {
              gte: monthStart,
            },
          },
        });

        return {
          id: tech.id,
          name: tech.name,
          resolved,
          isMe: tech.id === currentTechId,
        };
      }),
    );

    return comparison.sort((a, b) => b.resolved - a.resolved);
  }
}
