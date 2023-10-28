import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserRolesEnum } from '../constants/roles';

import { CreateUserDto } from './dto/createUser.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<Partial<User>> {
    const user = { ...userDto, role: UserRolesEnum.USER };

    return this.usersService.create(user);
  }
}
