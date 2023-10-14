import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModule } from '../files/files.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FileModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
