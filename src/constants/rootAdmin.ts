// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { CreateUserDto } from '../users/dto/createUser.dto';

import { UserRolesEnum } from './roles';

export const rootAdmin: CreateUserDto & { isActive: boolean } = {
  firstName: 'Admin',
  lastName: 'Admin',
  email: process.env.ROOT_ADMIN_EMAIL,
  password: process.env.ROOT_ADMIN_PASSWORD,
  nickname: 'SuperAdmin',
  isActive: true,
  role: UserRolesEnum.SUPERADMIN,
};
