import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateCommentRequest,
  ListResponse,
  TicketFilters,
} from '@/types';
import { fetchApi } from './api';

export const ticketService = {
  async getTickets(filters: TicketFilters = {}): Promise<ListResponse<Ticket>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    return fetchApi<ListResponse<Ticket>>(
      `/tickets?${params.toString()}`,
      { requiresAuth: true }
    );
  },

  async getTicketById(id: string): Promise<Ticket> {
    return fetchApi<Ticket>(`/tickets/${id}`, {
      requiresAuth: true,
    });
  },

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return fetchApi<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<Ticket> {
    return fetchApi<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async deleteTicket(id: string): Promise<void> {
    return fetchApi<void>(`/tickets/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  async addComment(ticketId: string, data: CreateCommentRequest): Promise<void> {
    return fetchApi<void>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};
