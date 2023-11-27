import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmailTemplates } from '../../constants/templates';
import { TokenEnum } from '../../constants/token';
import { CryptographyService } from '../../cryptography/cryptography.service';
import { EmailService } from '../../email/email.service';
import { LoggerService } from '../../logger/logger.service';
import { TokenService } from '../../token/token.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { User } from '../users.entity';
import { UsersService } from '../users.service';

const tokenServiceMock = {
  generate: jest.fn(() => ({ accessToken: 'token' })),
};

const loggerServiceMock = {
  error: jest.fn(),
};

const emailServiceMock = {
  sendEmail: jest.fn(),
};

const cryptographyServiceMock = {
  hashPassword: jest.fn((password: string) => `${password}_hashed`),
};

describe('UsersService', () => {
  let usersService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: CryptographyService,
          useValue: cryptographyServiceMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const createUserDto = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@gmail.com',
      nickname: 'nickname',
    } as CreateUserDto;

    it('creates user successfully', async () => {
      const sampleUser = { ...createUserDto, id: 1 } as User;

      jest
        .spyOn(usersService['usersRepository'], 'save')
        .mockResolvedValue(sampleUser);

      const result = await usersService.create(createUserDto);

      expect(result).toEqual({ id: 1 });
    });

    it('sends registration mail', async () => {
      const sampleUser = { ...createUserDto, id: 1 } as User;

      jest
        .spyOn(usersService['usersRepository'], 'save')
        .mockResolvedValue(sampleUser);

      await usersService.create(createUserDto);

      expect(emailServiceMock.sendEmail).toHaveBeenCalledWith({
        email: sampleUser.email,
        subject: EmailTemplates[TokenEnum.CONFIRM_USER_REGISTRATION].subject,
        template:
          EmailTemplates[TokenEnum.CONFIRM_USER_REGISTRATION].templateFileName,
        context: {
          token: 'token',
        },
      });
    });

    it('doesn"t send registration mail and registers user', async () => {
      const sampleUser = {
        ...createUserDto,
        id: 1,
        email: 'wrongEmail@gmail.com',
      } as User;

      jest
        .spyOn(usersService['usersRepository'], 'save')
        .mockResolvedValueOnce(sampleUser);

      jest
        .spyOn(emailServiceMock, 'sendEmail')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Failed to send mail')),
        );

      const result = await usersService.create(createUserDto);

      expect(result).toEqual({ id: 1 });
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('getByParams', () => {
    it('gets user by params', async () => {
      const params = {
        email: 'test@gmail.com',
      } as User;

      const sampleUser = {
        firstName: 'Test',
        lastName: 'Test',
        email: 'test@gmail.com',
        nickname: 'nickname',
        id: 1,
      } as User;

      jest
        .spyOn(usersService['usersRepository'], 'findOne')
        .mockResolvedValue(sampleUser);

      const result = await usersService.getByParams(params);

      expect(result).toEqual(sampleUser);
    });
  });

  describe('updateById', () => {
    const updateData = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@gmail.com',
      nickname: 'nicknameUpdated',
    } as CreateUserDto;

    it('updates user successfully', async () => {
      const sampleUser = {
        firstName: 'Test',
        lastName: 'Test',
        email: 'test@gmail.com',
        nickname: 'nickname',
        id: 1,
      } as User;

      jest
        .spyOn(usersService['usersRepository'], 'update')
        .mockResolvedValue({ affected: 1 } as any);

      jest
        .spyOn(usersService['usersRepository'], 'findOne')
        .mockResolvedValue(sampleUser);

      const result = await usersService.updateById(1, updateData);

      expect(result).toEqual(sampleUser);
    });

    it('throws an error if user was not updated', async () => {
      jest
        .spyOn(usersService['usersRepository'], 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(usersService.updateById(0, updateData)).rejects.toThrowError(
        'User with id 0 not udpated',
      );
    });
  });
});
