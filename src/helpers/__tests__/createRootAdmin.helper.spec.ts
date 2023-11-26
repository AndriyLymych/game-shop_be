import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '../../logger/logger.service';
import { UsersService } from '../../users/users.service';
import { RootAdminHelper } from '../createRootAdmin.helper';
import { getRootAdmin } from '../../constants/rootAdmin';

const loggerServiceMock = {
  info: jest.fn(),
  error: jest.fn(),
};

const usersServiceMock = {
  getByParams: jest.fn(({ email }: any) => {
    if (email === 'alreadyExists@gmail.com') {
      return {
        id: 1,
      };
    }

    if (email === 'withError@gmail.com') {
      throw new Error('Some error');
    }

    return null;
  }),
  create: jest.fn(),
};

describe('RootAdminHelper', () => {
  let rootAdminHelper: RootAdminHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RootAdminHelper,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    rootAdminHelper = new RootAdminHelper(
      module.get(UsersService),
      await module.resolve(LoggerService),
    );
  });

  describe('create', () => {
    const oldEnvEmail = process.env.ROOT_ADMIN_EMAIL;
    const oldEnvPassword = process.env.ROOT_ADMIN_PASSWORD;

    afterAll(() => {
      process.env.ROOT_ADMIN_EMAIL = oldEnvEmail;
      process.env.ROOT_ADMIN_PASSWORD = oldEnvPassword;
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('creates root admin successfully', async () => {
      process.env.ROOT_ADMIN_EMAIL = 'test@example.com';
      process.env.ROOT_ADMIN_PASSWORD = 'testPassword';

      await rootAdminHelper.create();

      expect(usersServiceMock.create).toHaveBeenCalledWith(getRootAdmin());
      expect(loggerServiceMock.info).toHaveBeenCalledWith({
        message: 'Root admin succussfully created',
        context: {
          method: 'create',
          service: 'RootAdminHelper',
        },
      });
    });

    it('returns if root admin already exists', async () => {
      process.env.ROOT_ADMIN_EMAIL = 'alreadyExists@gmail.com';

      await rootAdminHelper.create();

      expect(usersServiceMock.create).not.toBeCalled();
      expect(loggerServiceMock.info).toHaveBeenCalledWith({
        message: 'Root admin already succussfully created',
        context: {
          method: 'create',
          service: 'RootAdminHelper',
        },
      });
    });

    it('throws an error if user was not created', async () => {
      process.env.ROOT_ADMIN_EMAIL = 'withError@gmail.com';

      await expect(rootAdminHelper.create()).rejects.toThrowError(
        'Failed to register root admin: Some error',
      );

      expect(loggerServiceMock.error).toHaveBeenCalledWith({
        message: 'Some error',
        context: {
          method: 'create',
          service: 'RootAdminHelper',
        },
        trace: expect.anything(),
      });
    });
  });
});
