import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { CreateUserDto } from '../users/dto/createUser.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserAlreadyExistsMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const { email, nickname }: CreateUserDto = req.body;

    const userByEmail = await this.usersService.getByParams({ email });

    if (userByEmail) {
      throw new ForbiddenException(`User with email ${email} already exists`);
    }

    const userByNickname = await this.usersService.getByParams({ nickname });

    if (userByNickname) {
      throw new ForbiddenException(
        `User with nickname ${nickname} already exists`,
      );
    }

    next();
  }
}
