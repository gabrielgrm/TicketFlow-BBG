export type UserRole = 'CLIENT' | 'TECH' | 'SUPERVISOR';

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
  priority: TicketPriority | null;
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
  assignedToId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  user: UserBasic;
  createdAt: string;
  metadata?: any;
}

export interface LogFilters {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
}

// Profile metrics and performance data
export interface ProfileMetrics {
  assignedCount: number;
  resolvedThisMonth: number;
  avgResponseTime: string;
  resolutionRate: number;
  highPriorityResolved: number;
  lowPriorityResolved: number;
}

export interface ResolvedTrendData {
  labels: string[];
  resolved: number[];
}

export interface PriorityDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
}

export interface TeamComparisonEntry {
  id: string;
  name: string;
  resolved: number;
  isMe: boolean;
}

export interface HistoryEntry {
  id: string;
  title: string;
  priority: TicketPriority;
  resolvedAt: string;
  timeSpentHours: number;
  clientFeedback?: string;
}

export interface ProfileCharts {
  resolvedTrend: ResolvedTrendData;
  priorityDistribution: PriorityDistribution;
  teamComparison: TeamComparisonEntry[];
}

export interface ProfileData {
  metrics: ProfileMetrics;
  charts: ProfileCharts;
  history: HistoryEntry[];
}