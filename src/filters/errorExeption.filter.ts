import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { LoggerService } from '../logger/logger.service';

@Catch()
export class ErrorExeptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const trace = exception.stack;

    const classRegex = /at ([\w\d.]+)\.(\w+) \(/;
    const match = classRegex.exec(trace);
    let service = '';
    let method = '';

    if (match) {
      service = match[1];
      method = match[2];
    }

    this.logger.error({
      message: exception.message,
      trace,
      context: {
        service,
        method,
      },
    });

    response.status(status).json({
      message: exception.message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
