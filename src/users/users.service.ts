import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailTemplates } from '../constants/templates';
import { TokenEnum } from '../constants/token';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { LoggerService } from '../logger/logger.service';

import { CreateUserDto } from './dto/createUser.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private emailService: EmailService,
    private tokenService: TokenService,
    private cryptographyService: CryptographyService,
    private logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const password = await this.cryptographyService.hashPassword(
      createUserDto.password,
    );
    const user = { ...createUserDto, password };

    const { id, email } = await this.usersRepository.save(user);

    const { accessToken } = await this.tokenService.generate(
      TokenEnum.CONFIRM_USER_REGISTRATION,
      { userId: id },
    );

    try {
      await this.emailService.sendEmail({
        email,
        subject: EmailTemplates[TokenEnum.CONFIRM_USER_REGISTRATION].subject,
        template:
          EmailTemplates[TokenEnum.CONFIRM_USER_REGISTRATION].templateFileName,
        context: {
          token: accessToken,
        },
      });
    } catch (e) {
      this.logger.error({
        message: `Failed to send registration mail: ${e}`,
        trace: e.stack,
        context: { service: UsersService.name, method: this.create.name },
        payload: {
          userId: id,
        },
      });
    }

    return { id };
  }

  async getByParams(params: Partial<User>): Promise<User | null> {
    return this.usersRepository.findOne({
      where: params,
    });
  }

  async updateById(id: number, updateData: Partial<User>): Promise<User> {
    const { affected } = await this.usersRepository.update(id, updateData);

    if (affected <= 0) {
      throw new BadRequestException(`User with id ${id} not udpated`);
    }

    return this.getByParams({ id: +id });
  }
}
