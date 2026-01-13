export type UserRole = 'CLIENT' | 'TECH';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Basic user info used in relations (API returns id, name, email)
export interface UserBasic {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  createdBy: UserBasic;
  assignedToId: string | null;
  assignedTo: UserBasic | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  // For CLIENT creation, backend sets defaults; priority optional
  priority?: TicketPriority;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  // For TECH assignment
  assignedToId?: string | null;
}

export interface CreateCommentRequest {
  content: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  search?: string;
}
