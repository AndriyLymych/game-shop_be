import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { CryptographyService } from '../../cryptography/cryptography.service';

describe('CryptographyService', () => {
  let cryptographyService: CryptographyService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService],
    }).compile();

    cryptographyService = module.get<CryptographyService>(CryptographyService);
  });

  describe('hashPassword', () => {
    it('hashes password successfully', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await cryptographyService.hashPassword('password');

      expect(result).toBe('hashedPassword');
    });

    it('throws an error if something went wrong', async () => {
      jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Hash password error')),
        );

      await expect(
        cryptographyService.hashPassword('password'),
      ).rejects.toThrowError('Failed to hash password: Hash password error');
    });
  });

  describe('checkPassword', () => {
    it('checks password successfully', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await cryptographyService.checkPassword(
        'password',
        'hashedPassword',
      );

      expect(result).toBe(true);
    });

    it('throws an error if something went wrong', async () => {
      const compareMock = jest.spyOn(bcrypt, 'compare');
      compareMock.mockImplementationOnce(() => {
        throw new Error('Comparing password error');
      });

      await expect(
        cryptographyService.checkPassword('password', 'hashedPassword'),
      ).rejects.toThrowError(
        'Failed to check password: Comparing password error',
      );

      compareMock.mockRestore();
    });
  });
});
