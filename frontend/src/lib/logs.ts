import { AuditLog, ListResponse, LogFilters } from '@/types';
import { fetchApi } from './api';

export const logService = {
  async getLogs(filters: LogFilters = {}): Promise<ListResponse<AuditLog>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.action) params.append('action', filters.action);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.entityId) params.append('entityId', filters.entityId);
    if (filters.userId) params.append('userId', filters.userId);

    return fetchApi<ListResponse<AuditLog>>(
      `/logs?${params.toString()}`,
      { requiresAuth: true }
    );
  },

  async getTicketLogs(ticketId: string): Promise<AuditLog[]> {
    return fetchApi<AuditLog[]>(
      `/logs/ticket/${ticketId}`,
      { requiresAuth: true }
    );
  },
};
