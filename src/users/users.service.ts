import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import cryptography from '../helpers/cryptography.helper';
import { PHOTO_CATEGORY } from '../constants/photoFoldersCategory';
import { FilesService } from '../files/files.service';

import { CreateUserDto } from './dto/createUser.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    avatar?: Express.Multer.File,
  ): Promise<User | void> {
    const password = await cryptography.hashPassword(createUserDto.password);
    const user = { ...createUserDto, password };

    await this.usersRepository.save(user);

    if (avatar) {
      await this.filesService.uploadFile(avatar, PHOTO_CATEGORY.GAMES);
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }
}
