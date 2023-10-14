import { BadRequestException } from '@nestjs/common';
import { genSalt, hash, compare } from 'bcrypt';

import { CryptographyEnum } from '../constants/cryptography';

class CryptographyHelper {
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await genSalt(CryptographyEnum.SALT_ROUNDS);

      return hash(password, salt);
    } catch (e) {
      throw new BadRequestException(`Failed to hash password: ${e.message}`);
    }
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    try {
      return compare(password, hash);
    } catch (e) {
      throw new BadRequestException(`Failed to check password: ${e.message}`);
    }
  }
}

export default new CryptographyHelper();
