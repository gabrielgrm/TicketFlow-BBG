/**
 * Centralized constants for consistent translations and values across the application
 */

export const STATUS_LABELS = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Progresso',
  DONE: 'Concluído',
} as const;

export const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
  UNDEFINED: 'Indefinida',
} as const;

export const ACTION_LABELS = {
  CREATE: 'Criado',
  UPDATE: 'Atualizado',
  DELETE: 'Excluído',
  ASSIGN: 'Atribuído',
  COMMENT_ADD: 'Comentário',
  COMMENT_DELETE: 'Comentário Excluído',
} as const;

export const ENTITY_TYPE_LABELS = {
  TICKET: 'Ticket',
  COMMENT: 'Comentário',
} as const;

export const ROLE_LABELS = {
  CLIENT: 'Cliente',
  TECH: 'Técnico',
  SUPERVISOR: 'Supervisor',
} as const;

// Default pagination size
export const DEFAULT_PAGE_SIZE = 10;
export const LOGS_PAGE_SIZE = 20;

// API timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Auth storage keys
export const AUTH_TOKEN_KEY = 'token';

// Validation patterns
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
