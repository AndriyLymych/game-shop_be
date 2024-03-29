import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CryptographyModule } from '../cryptography/cryptography.module';
import { UserAlreadyExistsMiddleware } from '../middlewares/userAlreadyExists.middleware';
import { LoggerModule } from '../logger/logger.module';
import { TokenModule } from '../token/token.module';
import { EmailModule } from '../email/email.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    LoggerModule,
    TokenModule,
    EmailModule,
    CryptographyModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAlreadyExistsMiddleware).forRoutes({
      path: 'users',
      method: RequestMethod.POST,
    });
  }
}
