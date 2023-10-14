import { BadRequestException } from '@nestjs/common';

import { User } from '../users/users.entity';
import { rootAdmin } from '../constants/rootAdmin';
import { UsersService } from '../users/users.service';

export class RootAdminHelper {
  constructor(private usersService: UsersService) {}

  async create(): Promise<User | void> {
    try {
      const isAdminAlreadyAdded = await this.usersService.getByEmail(
        rootAdmin.email,
      );

      if (isAdminAlreadyAdded) {
        return;
      }

      return this.usersService.create(rootAdmin);
    } catch (e) {
      throw new BadRequestException(
        `Failed to register root admin: ${e.message}`,
      );
    }
  }
}
