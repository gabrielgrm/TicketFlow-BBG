import { fetchApi } from './api';

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

export interface TrendData {
  labels: string[];
  created: number[];
  resolved: number[];
}

export interface PriorityData {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
}

export interface Technician {
  id: string;
  name: string;
  assigned: number;
  resolved: number;
  avgTime: string;
}

export interface CriticalTicket {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignedTo: {
    name: string;
  } | null;
}

export interface RecentAction {
  id: string;
  action: string;
  entityType: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return fetchApi<DashboardStats>('/dashboard/stats', {
      requiresAuth: true,
    });
  },

  async getTrends(days: number = 7): Promise<TrendData> {
    const params = new URLSearchParams({ days: days.toString() });
    return fetchApi<TrendData>(`/dashboard/charts/trends?${params}`, {
      requiresAuth: true,
    });
  },

  async getPriorityData(): Promise<PriorityData> {
    return fetchApi<PriorityData>('/dashboard/charts/priority', {
      requiresAuth: true,
    });
  },

  async getTechnicians(): Promise<Technician[]> {
    return fetchApi<Technician[]>('/dashboard/technicians', {
      requiresAuth: true,
    });
  },

  async getCriticalTickets(): Promise<CriticalTicket[]> {
    return fetchApi<CriticalTicket[]>('/dashboard/critical-tickets', {
      requiresAuth: true,
    });
  },

  async getRecentActions(limit: number = 10): Promise<RecentAction[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    return fetchApi<RecentAction[]>(`/dashboard/recent-actions?${params}`, {
      requiresAuth: true,
    });
  },
};
