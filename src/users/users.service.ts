import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import cryptography from '../helpers/cryptography.helper';

import { CreateUserDto } from './dto/createUser.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const password = await cryptography.hashPassword(createUserDto.password);
    const user = { ...createUserDto, password };

    const { id } = await this.usersRepository.save(user);

    return { id };
  }

  async getByParams(params: Partial<User>): Promise<User | null> {
    return this.usersRepository.findOne({
      where: params,
    });
  }

  async updateById(id: string, updateData: Partial<User>): Promise<User> {
    const { affected } = await this.usersRepository.update(id, updateData);

    if (affected <= 0) {
      throw new BadRequestException(`User with id ${id} not udpated`);
    }

    return this.getByParams({ id: +id });
  }
}
