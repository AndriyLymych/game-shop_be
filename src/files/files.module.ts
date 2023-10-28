import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { UserExistsMiddleware } from '../middlewares/userExists.middleware';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [LoggerModule, UsersModule],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserExistsMiddleware).forRoutes({
      path: 'files/upload/avatar/:userId',
      method: RequestMethod.POST,
    });
  }
}
