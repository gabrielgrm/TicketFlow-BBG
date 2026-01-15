import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { DASHBOARD } from '../common/constants';

export interface DashboardStats {
  openToday: number;
  totalPending: number;
  resolvedToday: number;
  avgResponseTime: string;
  urgentPending: number;
  unassigned: number;
  overdueTickets: number;
  resolutionRate: number;
}

export interface ChartTrends {
  labels: string[];
  created: number[];
  resolved: number[];
}

export interface PriorityDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
}

export interface TechnicianMetrics {
  id: string;
  name: string;
  assigned: number;
  resolved: number;
  avgTime: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const twoDaysAgo = new Date(now.getTime() - DASHBOARD.DEFAULT_TREND_DAYS * 48 * 60 * 60 * 1000);

    const [
      openToday,
      totalPending,
      resolvedToday,
      urgentPending,
      unassigned,
      overdueTickets,
      createdThisMonth,
      resolvedThisMonth,
      assignedTickets,
    ] = await Promise.all([
      this.prisma.ticket.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.ticket.count({
        where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
      }),
      this.prisma.ticket.count({
        where: {
          status: TicketStatus.DONE,
          updatedAt: { gte: todayStart },
        },
      }),
      this.prisma.ticket.count({
        where: {
          priority: TicketPriority.URGENT,
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.ticket.count({
        where: {
          assignedToId: null,
          status: { not: TicketStatus.DONE },
        },
      }),
      this.prisma.ticket.count({
        where: {
          createdAt: { lt: twoDaysAgo },
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.ticket.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.ticket.count({
        where: {
          status: TicketStatus.DONE,
          updatedAt: { gte: monthStart },
        },
      }),
      this.prisma.ticket.findMany({
        where: { assignedToId: { not: null } },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    const resolutionRate = createdThisMonth > 0 
      ? (resolvedThisMonth / createdThisMonth) * 100 
      : 0;

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

  async getChartTrends(days: number = DASHBOARD.DEFAULT_TREND_DAYS): Promise<ChartTrends> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [createdTickets, resolvedTickets] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      this.prisma.ticket.findMany({
        where: {
          status: TicketStatus.DONE,
          updatedAt: { gte: startDate },
        },
        select: { updatedAt: true },
      }),
    ]);

    const labels: string[] = [];
    const created: number[] = [];
    const resolved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      const createdCount = createdTickets.filter(
        t => t.createdAt >= dayStart && t.createdAt < dayEnd
      ).length;
      created.push(createdCount);

      const resolvedCount = resolvedTickets.filter(
        t => t.updatedAt >= dayStart && t.updatedAt < dayEnd
      ).length;
      resolved.push(resolvedCount);
    }

    return { labels, created, resolved };
  }

  async getChartPriority(): Promise<PriorityDistribution> {
    const priorities = await this.prisma.ticket.groupBy({
      by: ['priority'],
      _count: { priority: true },
      where: { status: { not: TicketStatus.DONE } },
    });

    const result: PriorityDistribution = {
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

  async getTechnicians(): Promise<TechnicianMetrics[]> {
    const [technicians, ticketCounts, resolvedTickets] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'TECH' },
        select: { id: true, name: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['assignedToId'],
        _count: { id: true },
        where: {
          assignedToId: { not: null },
          status: { not: TicketStatus.DONE },
        },
      }),
      this.prisma.ticket.findMany({
        where: {
          assignedToId: { not: null },
          status: TicketStatus.DONE,
          resolvedAt: { not: null },
        },
        select: {
          assignedToId: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),
    ]);

    const assignedMap = new Map(
      ticketCounts.map(tc => [tc.assignedToId!, tc._count.id])
    );

    const resolvedMap = new Map<string, { count: number; totalMinutes: number }>();
    resolvedTickets.forEach(ticket => {
      if (ticket.assignedToId && ticket.resolvedAt) {
        const existing = resolvedMap.get(ticket.assignedToId) || { count: 0, totalMinutes: 0 };
        const minutes = (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
        resolvedMap.set(ticket.assignedToId, {
          count: existing.count + 1,
          totalMinutes: existing.totalMinutes + minutes,
        });
      }
    });

    return technicians.map(tech => {
      const assigned = assignedMap.get(tech.id) || 0;
      const resolvedData = resolvedMap.get(tech.id) || { count: 0, totalMinutes: 0 };

      let avgTime = '0h 0min';
      if (resolvedData.count > 0) {
        const avgMinutes = Math.floor(resolvedData.totalMinutes / resolvedData.count);
        const hours = Math.floor(avgMinutes / 60);
        const minutes = avgMinutes % 60;
        avgTime = `${hours}h ${minutes}min`;
      }

      return {
        id: tech.id,
        name: tech.name,
        assigned,
        resolved: resolvedData.count,
        avgTime,
      };
    });
  }

  async getCriticalTickets() {
    return this.prisma.ticket.findMany({
      where: {
        priority: { in: [TicketPriority.URGENT, TicketPriority.HIGH] },
        status: { not: TicketStatus.DONE },
      },
      orderBy: { createdAt: 'asc' },
      take: DASHBOARD.DEFAULT_CRITICAL_TICKETS,
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        assignedTo: {
          select: { name: true },
        },
      },
    });
  }

  async getRecentActions(limit: number = DASHBOARD.DEFAULT_RECENT_ACTIONS) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  }
}
