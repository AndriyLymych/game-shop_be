import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    const path = context.switchToHttp().getRequest().url;
    const service = context.getClass().name;
    const method = context.getHandler().name;

    return next.handle().pipe(
      map((data) => {
        const response = {
          data,
          statusCode,
          timestamp: new Date().toISOString(),
          path,
        };

        this.logger.info({
          message: `Method ${method} in ${service} service is succussfully completed`,
          context: {
            service,
            method,
          },
          payload: response,
        });

        return response;
      }),
    );
  }
}
