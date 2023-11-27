import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../users/users.service';
import { UserExistsMiddleware } from '../userExists.middleware';

const userServiceMock = {
  getByParams: jest.fn(({ id }: any) => {
    if (Number.isNaN(id)) {
      return;
    }

    return { email: 'user@gmail.com' };
  }),
};

describe('UserExistsMiddleware', () => {
  const next: any = jest.fn();
  const res: any = jest.fn();

  let userExistsMiddleware: UserExistsMiddleware;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserExistsMiddleware,
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    userExistsMiddleware =
      module.get<UserExistsMiddleware>(UserExistsMiddleware);
  });

  describe('use', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('moves next successfully', async () => {
      await userExistsMiddleware.use(
        {
          params: {
            userId: '1',
          },
        } as any,
        res,
        next,
      );

      expect(next).toHaveBeenCalled();
    });

    it('throws an error if userId is not exists', async () => {
      await expect(
        userExistsMiddleware.use(
          {
            params: {
              userId: '',
            },
          } as any,
          res,
          next,
        ),
      ).rejects.toThrowError('Missed userId param');

      expect(next).not.toHaveBeenCalled();
    });

    it('throws an error if user with wrongId is not exists', async () => {
      await expect(
        userExistsMiddleware.use(
          {
            params: {
              userId: 'wrongId',
            },
          } as any,
          res,
          next,
        ),
      ).rejects.toThrowError('Unable to find user with id: wrongId');

      expect(next).not.toHaveBeenCalled();
    });
  });
});
