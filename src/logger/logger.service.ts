import { Injectable, Logger, Scope } from '@nestjs/common';
import * as winston from 'winston';

import { LoggerDto } from './dto/logger.dto';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private logger: winston.Logger;

  constructor() {
    super();
    const logFormat = winston.format.combine(
      winston.format.colorize({
        all: true,
        colors: { info: 'blue', error: 'red' },
      }),
      winston.format.timestamp(),
      winston.format.printf(
        ({
          timestamp,
          level,
          message,
          context,
          trace,
          payload,
        }: LoggerDto & { level: string; timestamp: string }) => {
          return `${timestamp} [${level}] [${JSON.stringify(
            context,
          )}] MESSAGE: ${message} ${
            payload ? 'PAYLOAD: ' + JSON.stringify(payload) : ''
          }  ${trace ? 'TRACE: ' + trace : ''}`;
        },
      ),
    );

    this.logger = winston.createLogger({
      level: 'info',
      format: logFormat,
      transports: [new winston.transports.Console()],
    });
  }

  error({ message, trace, context, payload }: LoggerDto) {
    this.logger.error(message, { trace, context, payload });
  }

  warn({ message, context, payload }: LoggerDto) {
    this.logger.warn(message, { context, payload });
  }

  info({ message, context, payload }: LoggerDto) {
    this.logger.info(message, { context, payload });
  }

  debug({ message, context, payload }: LoggerDto) {
    this.logger.debug(message, { context, payload });
  }
}
