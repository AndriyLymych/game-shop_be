import { BadRequestException } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

import { getRootAdmin } from '../constants/rootAdmin';
import { UsersService } from '../users/users.service';

export class RootAdminHelper {
  constructor(
    private usersService: UsersService,
    private logger: LoggerService,
  ) {}

  async create(): Promise<void> {
    try {
      const isAdminAlreadyAdded = await this.usersService.getByParams({
        email: getRootAdmin().email,
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

      await this.usersService.create(getRootAdmin());

      this.logger.info({
        message: 'Root admin succussfully created',
        context: {
          service: RootAdminHelper.name,
          method: this.create.name,
        },
      });
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
