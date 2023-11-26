import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { TokenEnum } from '../constants/token';

export interface Token {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class TokenService {
  async generate(
    type: TokenEnum,
    payload: Record<string, any>,
  ): Promise<Token> {
    try {
      let accessToken = '';
      // it will be chanhed with handling other token types
      const refreshToken = '';

      if (type === TokenEnum.CONFIRM_USER_REGISTRATION) {
        accessToken = await jwt.sign(
          payload,
          process.env.REGISTRATION_USER_SECRET,
          {
            expiresIn: process.env.REGISTRATION_USER_EXPIRES_IN,
          },
        );
      }

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new BadRequestException(`Failed to generate tokens: ${e.message}`);
    }
  }

  async check(type: TokenEnum, token: string): Promise<boolean> {
    try {
      if (type === TokenEnum.CONFIRM_USER_REGISTRATION) {
        await jwt.verify(token, process.env.REGISTRATION_USER_SECRET);
      }

      return true;
    } catch (e) {
      throw new UnauthorizedException(`Failed to verify token: ${e.message}`);
    }
  }
}
