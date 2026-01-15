/**
 * Centralized badge styling and labels for consistent UI across the application
 */

import { TicketStatus, TicketPriority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS, ACTION_LABELS, ENTITY_TYPE_LABELS, ROLE_LABELS } from './constants';

export const statusVariants: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: STATUS_LABELS.OPEN, className: 'bg-blue-500 text-white whitespace-nowrap' },
  IN_PROGRESS: { label: STATUS_LABELS.IN_PROGRESS, className: 'bg-yellow-500 text-white whitespace-nowrap' },
  DONE: { label: STATUS_LABELS.DONE, className: 'bg-green-500 text-white whitespace-nowrap' },
};

export const priorityVariants: Record<TicketPriority | 'UNDEFINED', { label: string; className: string }> = {
  LOW: { label: PRIORITY_LABELS.LOW, className: 'bg-gray-500 text-white' },
  MEDIUM: { label: PRIORITY_LABELS.MEDIUM, className: 'bg-purple-500 text-white' },
  HIGH: { label: PRIORITY_LABELS.HIGH, className: 'bg-orange-500 text-white' },
  URGENT: { label: PRIORITY_LABELS.URGENT, className: 'bg-red-500 text-white' },
  UNDEFINED: { label: PRIORITY_LABELS.UNDEFINED, className: 'bg-gray-300 text-gray-700' },
};

export const actionVariants: Record<string, { label: string; className: string }> = {
  CREATE: { label: ACTION_LABELS.CREATE, className: 'bg-green-500 text-white' },
  UPDATE: { label: ACTION_LABELS.UPDATE, className: 'bg-blue-500 text-white' },
  DELETE: { label: ACTION_LABELS.DELETE, className: 'bg-red-500 text-white' },
  ASSIGN: { label: ACTION_LABELS.ASSIGN, className: 'bg-purple-500 text-white' },
  COMMENT_ADD: { label: ACTION_LABELS.COMMENT_ADD, className: 'bg-cyan-500 text-white' },
  COMMENT_DELETE: { label: ACTION_LABELS.COMMENT_DELETE, className: 'bg-orange-500 text-white' },
};

export const entityTypeLabels: Record<string, string> = {
  TICKET: ENTITY_TYPE_LABELS.TICKET,
  COMMENT: ENTITY_TYPE_LABELS.COMMENT,
};

export const userRoleLabels: Record<string, string> = {
  CLIENT: ROLE_LABELS.CLIENT,
  TECH: ROLE_LABELS.TECH,
  SUPERVISOR: ROLE_LABELS.SUPERVISOR,
};

/**
 * Get status label and styling
 */
export function getStatusVariant(status: TicketStatus) {
  return statusVariants[status] || { label: status, className: 'bg-gray-500 text-white' };
}

/**
 * Get priority label and styling
 */
export function getPriorityVariant(priority: TicketPriority | null) {
  if (!priority) {
    return priorityVariants.UNDEFINED;
  }
  return priorityVariants[priority] || { label: priority, className: 'bg-gray-500 text-white' };
}

/**
 * Get action label and styling
 */
export function getActionVariant(action: string) {
  return actionVariants[action] || { label: action, className: 'bg-gray-500 text-white' };
}

/**
 * Get entity type label
 */
export function getEntityTypeLabel(entityType: string): string {
  return entityTypeLabels[entityType] || entityType;
}

/**
 * Get user role label
 */
export function getUserRoleLabel(role: string): string {
  return userRoleLabels[role] || role;
}
