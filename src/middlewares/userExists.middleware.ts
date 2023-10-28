import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { UsersService } from '../users/users.service';

@Injectable()
export class UserExistsMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestException('Missed userId param');
    }

    const userById = await this.usersService.getByParams({ id: +userId });

    if (!userById) {
      throw new ForbiddenException(`Unable to find user with id: ${userId}`);
    }

    next();
  }
}
