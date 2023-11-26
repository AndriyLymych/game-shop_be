import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../users/users.service';
import { UserAlreadyExistsMiddleware } from '../userAlreadyExists.middleware';

const userServiceMock = {
  getByParams: jest.fn(({ email, nickname }: any) => {
    if (
      email === 'alreadyExistsEmail@gmail.com' ||
      nickname === 'alreadyExistsNickname'
    ) {
      return { email, nickname };
    }

    return;
  }),
};

describe('UserAlreadyExistsMiddleware', () => {
  const next: any = jest.fn();
  const res: any = jest.fn();

  let userAlreadyExistsMiddleware: UserAlreadyExistsMiddleware;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAlreadyExistsMiddleware,
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    userAlreadyExistsMiddleware = module.get<UserAlreadyExistsMiddleware>(
      UserAlreadyExistsMiddleware,
    );
  });

  describe('use', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('moves next successfully', async () => {
      await userAlreadyExistsMiddleware.use(
        {
          body: {
            email: 'user@gmail.com',
            nickname: 'nickname',
          },
        } as any,
        res,
        next,
      );

      expect(next).toHaveBeenCalled();
    });

    it('throws an error if user with alreadyExistsEmail@gmail.com email already exists', async () => {
      await expect(
        userAlreadyExistsMiddleware.use(
          {
            body: {
              email: 'alreadyExistsEmail@gmail.com',
              nickname: 'nickname',
            },
          } as any,
          res,
          next,
        ),
      ).rejects.toThrowError(
        'User with email alreadyExistsEmail@gmail.com already exists',
      );

      expect(next).not.toHaveBeenCalled();
    });

    it('throws an error if user with alreadyExistsNickname nickname already exists', async () => {
      await expect(
        userAlreadyExistsMiddleware.use(
          {
            body: {
              email: 'user@gmail.com',
              nickname: 'alreadyExistsNickname',
            },
          } as any,
          res,
          next,
        ),
      ).rejects.toThrowError(
        'User with nickname alreadyExistsNickname already exists',
      );

      expect(next).not.toHaveBeenCalled();
    });
  });
});
