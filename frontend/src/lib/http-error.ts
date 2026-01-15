/**
 * HTTP error response handler
 * Provides consistent error handling across the application
 */

import { translateErrorMessage } from './utils';

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public originalMessage: string
  ) {
    const translatedMessage = translateErrorMessage(originalMessage);
    super(translatedMessage);
    this.name = 'HttpError';
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Parse and handle HTTP error responses
 */
export async function handleHttpError(response: Response): Promise<HttpError> {
  let message = response.statusText;

  try {
    const data = (await response.json()) as ApiErrorResponse;
    message = data.message || message;
  } catch {
    // If response is not JSON, use statusText
  }

  return new HttpError(response.status, message);
}
