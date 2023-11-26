import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';

import { TokenEnum } from '../../constants/token';
import { TokenService, Token } from '../../token/token.service';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
  });

  describe('generate', () => {
    it('generates tokens successfully', async () => {
      jest.spyOn(jwt, 'sign').mockResolvedValue('token' as never);

      const result = await tokenService.generate(
        TokenEnum.CONFIRM_USER_REGISTRATION,
        { userId: 1 },
      );

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: '',
      } as Token);
    });

    it('throws an error if something went wrong', async () => {
      jest
        .spyOn(jwt, 'sign')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Token creation error')),
        );

      await expect(
        tokenService.generate(TokenEnum.CONFIRM_USER_REGISTRATION, {
          userId: 1,
        }),
      ).rejects.toThrowError('Failed to generate tokens: Token creation error');
    });
  });

  describe('check', () => {
    it('check token successfully', async () => {
      jest.spyOn(jwt, 'verify').mockResolvedValue({ userId: 1 } as never);

      const result = await tokenService.check(
        TokenEnum.CONFIRM_USER_REGISTRATION,
        'token',
      );

      expect(result).toBe(true);
    });

    it('throws an error if something went wrong', async () => {
      jest
        .spyOn(jwt, 'verify')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Token verification error')),
        );

      await expect(
        tokenService.check(TokenEnum.CONFIRM_USER_REGISTRATION, 'token'),
      ).rejects.toThrowError(
        'Failed to verify token: Token verification error',
      );
    });
  });
});
