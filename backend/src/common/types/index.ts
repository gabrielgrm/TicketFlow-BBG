import { User, Ticket, Comment, UserRole } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

export type SafeUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface TicketWithRelations extends Ticket {
  createdBy: SafeUser;
  assignedTo: SafeUser | null;
  comments: CommentWithUser[];
}

export interface CommentWithUser extends Comment {
  user: SafeUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user?: UserWithoutPassword;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}
