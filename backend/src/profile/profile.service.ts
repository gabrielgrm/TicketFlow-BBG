import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { ERROR_MESSAGES, DASHBOARD } from '../common/constants';
import { safeUserSelect } from '../common/selectors';

export interface TechMetrics {
  metrics: {
    assignedCount: number;
    resolvedThisMonth: number;
    avgResponseTime: string;
    resolutionRate: number;
    highPriorityResolved: number;
    lowPriorityResolved: number;
  };
  charts: {
    resolvedTrend: { labels: string[]; resolved: number[] };
    priorityDistribution: Record<string, number>;
    teamComparison: Array<{ id: string; name: string; resolved: number; isMe: boolean }>;
  };
  history: Array<{
    id: string;
    title: string;
    priority: TicketPriority | null;
    resolvedAt: Date | null;
    timeSpentHours: number;
    clientFeedback: string | null;
  }>;
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyMetrics(userId: string): Promise<TechMetrics> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return this.calculateTechMetrics(userId);
  }

  async getTechProfile(techId: string): Promise<TechMetrics> {
    const tech = await this.prisma.user.findUnique({
      where: { id: techId },
    });

    if (!tech) {
      throw new NotFoundException(ERROR_MESSAGES.TECH_NOT_FOUND);
    }

    return this.calculateTechMetrics(techId);
  }

  private async calculateTechMetrics(techId: string): Promise<TechMetrics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      assignedTickets,
      resolvedThisMonth,
      assignedWithFirstComment,
      allAssignedCount,
      lastResolvedTickets,
    ] = await Promise.all([
      this.prisma.ticket.findMany({
        where: {
          assignedToId: techId,
          status: { not: TicketStatus.DONE },
        },
        select: { id: true, priority: true },
      }),
      this.prisma.ticket.findMany({
        where: {
          assignedToId: techId,
          status: TicketStatus.DONE,
          updatedAt: { gte: monthStart },
        },
        select: {
          id: true,
          priority: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),
      this.prisma.ticket.findMany({
        where: { assignedToId: techId },
        select: {
          createdAt: true,
          comments: {
            where: { userId: techId },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
      this.prisma.ticket.count({
        where: { assignedToId: techId },
      }),
      this.prisma.ticket.findMany({
        where: {
          assignedToId: techId,
          status: TicketStatus.DONE,
        },
        orderBy: { resolvedAt: 'desc' },
        take: DASHBOARD.PROFILE_HISTORY_LIMIT,
        include: {
          createdBy: { select: { name: true } },
          comments: {
            where: { userId: { not: techId } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true },
          },
        },
      }),
    ]);

    const assignedCount = assignedTickets.length;
    const resolvedCount = resolvedThisMonth.length;

    let avgResponseTime = '0h 0min';
    const ticketsWithResponse = assignedWithFirstComment.filter(
      (t) => t.comments.length > 0
    );
    if (ticketsWithResponse.length > 0) {
      const totalMinutes = ticketsWithResponse.reduce((sum, ticket) => {
        const diff =
          ticket.comments[0].createdAt.getTime() - ticket.createdAt.getTime();
        return sum + diff / (1000 * 60);
      }, 0);

      const avgMinutes = Math.floor(totalMinutes / ticketsWithResponse.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgResponseTime = `${hours}h ${minutes}min`;
    }

    const resolutionRate =
      allAssignedCount > 0
        ? parseFloat(((resolvedCount / allAssignedCount) * 100).toFixed(1))
        : 0;

    const highPriorityResolved = resolvedThisMonth.filter(
      (t) =>
        t.priority === TicketPriority.HIGH ||
        t.priority === TicketPriority.URGENT
    ).length;

    const lowPriorityResolved = resolvedThisMonth.filter(
      (t) =>
        t.priority === TicketPriority.LOW ||
        t.priority === TicketPriority.MEDIUM
    ).length;

    const history = lastResolvedTickets.map((ticket) => {
      const timeSpent =
        ticket.resolvedAt && ticket.createdAt
          ? Math.floor(
              (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
                (1000 * 60 * 60)
            )
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

    const [resolvedTrend, priorityDistribution, teamComparison] =
      await Promise.all([
        this.getResolvedTrendData(techId, DASHBOARD.PROFILE_TREND_DAYS),
        this.getPriorityDistribution(techId),
        this.getTeamComparison(techId),
      ]);

    return {
      metrics: {
        assignedCount,
        resolvedThisMonth: resolvedCount,
        avgResponseTime,
        resolutionRate,
        highPriorityResolved,
        lowPriorityResolved,
      },
      charts: {
        resolvedTrend,
        priorityDistribution,
        teamComparison,
      },
      history,
    };
  }

  private async getResolvedTrendData(
    techId: string,
    days: number
  ): Promise<{ labels: string[]; resolved: number[] }> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const resolvedTickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: techId,
        status: TicketStatus.DONE,
        resolvedAt: {
          gte: startDate,
        },
      },
      select: { resolvedAt: true },
    });

    const labels: string[] = [];
    const resolved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      const count = resolvedTickets.filter(
        (t) => t.resolvedAt && t.resolvedAt >= dayStart && t.resolvedAt < dayEnd
      ).length;

      resolved.push(count);
    }

    return { labels, resolved };
  }

  private async getPriorityDistribution(
    techId: string
  ): Promise<Record<string, number>> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const priorities = await this.prisma.ticket.groupBy({
      by: ['priority'],
      _count: { priority: true },
      where: {
        assignedToId: techId,
        status: TicketStatus.DONE,
        updatedAt: { gte: monthStart },
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

  private async getTeamComparison(
    currentTechId: string
  ): Promise<Array<{ id: string; name: string; resolved: number; isMe: boolean }>> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [techs, resolvedCounts] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'TECH' },
        select: { id: true, name: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['assignedToId'],
        _count: { id: true },
        where: {
          assignedToId: { not: null },
          status: TicketStatus.DONE,
          updatedAt: { gte: monthStart },
        },
      }),
    ]);

    const resolvedMap = new Map(
      resolvedCounts.map((rc) => [rc.assignedToId!, rc._count.id])
    );

    const comparison = techs.map((tech) => ({
      id: tech.id,
      name: tech.name,
      resolved: resolvedMap.get(tech.id) || 0,
      isMe: tech.id === currentTechId,
    }));

    return comparison.sort((a, b) => b.resolved - a.resolved);
  }
}
