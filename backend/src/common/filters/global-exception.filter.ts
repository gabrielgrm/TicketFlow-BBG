import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error: string;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const objResponse = exceptionResponse as any;
        message = objResponse.message || message;
        errorCode = objResponse.error || this.getErrorCode(statusCode);
      } else {
        message = exceptionResponse as string;
        errorCode = this.getErrorCode(statusCode);
      }
    } else if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_REQUEST';
      message = (exception as any).message || 'Bad request';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;
    }

    const errorResponse: ErrorResponse = {
      error: errorCode,
      message,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorCode(statusCode: number): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
    };

    return codeMap[statusCode] || 'INTERNAL_SERVER_ERROR';
  }
}
