import { BadRequestException } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

import { User } from '../users/users.entity';
import { rootAdmin } from '../constants/rootAdmin';
import { UsersService } from '../users/users.service';

export class RootAdminHelper {
  constructor(
    private usersService: UsersService,
    private logger: LoggerService,
  ) {}

  async create(): Promise<User | void> {
    try {
      const isAdminAlreadyAdded = await this.usersService.getByParams({
        email: rootAdmin.email,
      });

      if (isAdminAlreadyAdded) {
        this.logger.info({
          message: 'Root admin already succussfully created',
          context: {
            service: RootAdminHelper.name,
            method: this.create.name,
          },
        });

        return;
      }

      const admin = await this.usersService.create(rootAdmin);

      this.logger.info({
        message: 'Root admin succussfully created',
        context: {
          service: RootAdminHelper.name,
          method: this.create.name,
        },
      });

      return admin;
    } catch (e) {
      this.logger.error({
        message: e.message,
        trace: e.stack,
        context: { service: RootAdminHelper.name, method: this.create.name },
      });

      throw new BadRequestException(
        `Failed to register root admin: ${e.message}`,
      );
    }
  }
}
