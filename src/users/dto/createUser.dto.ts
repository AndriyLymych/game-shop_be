import { UserRolesEnum } from '../../constants/roles';

export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly nickname: string;
  readonly role?: UserRolesEnum;
}
