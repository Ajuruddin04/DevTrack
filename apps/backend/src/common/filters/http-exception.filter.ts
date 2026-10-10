import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resResponse = exception.getResponse() as any;

      if (typeof resResponse === 'string') {
        message = resResponse;
      } else if (typeof resResponse === 'object' && resResponse !== null) {
        message = resResponse.message || exception.message;
        error = resResponse.error || exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Error on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    }

    // Never expose stack traces or raw database error details to client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    });
  }
}
