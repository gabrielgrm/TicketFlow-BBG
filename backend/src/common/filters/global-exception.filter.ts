import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'Erro interno do servidor';

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
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'DATABASE_ERROR';
      message = this.handlePrismaError(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = 'Erro de validação nos dados';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(statusCode).json(errorResponse);
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'Registro duplicado';
      case 'P2025':
        return 'Registro não encontrado';
      case 'P2003':
        return 'Violação de chave estrangeira';
      case 'P2014':
        return 'Violação de relação';
      default:
        return 'Erro ao processar dados';
    }
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
