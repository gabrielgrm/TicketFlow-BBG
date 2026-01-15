import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Translate API error messages to user-friendly Portuguese messages
 * Falls back to the original message if no translation is found
 */
export function translateErrorMessage(message: string): string {
  const translations: Record<string, string> = {
    'Unauthorized': 'Não autorizado. Por favor, faça login novamente.',
    'Forbidden': 'Você não tem permissão para acessar este recurso.',
    'Not found': 'Recurso não encontrado.',
    'Already exists': 'Este recurso já existe.',
    'Invalid email': 'Email inválido.',
    'Invalid password': 'Senha inválida.',
    'User already exists': 'Este usuário já está registrado.',
    'Email already registered': 'Este email já está registrado.',
  };

  return translations[message] || message;
}

/**
 * Format date to Portuguese locale
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Format datetime to Portuguese locale
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
}

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
