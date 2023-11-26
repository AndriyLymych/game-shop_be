import { Test, TestingModule } from '@nestjs/testing';
import * as classValidator from 'class-validator';
import * as classTransformer from 'class-transformer';

import { ValidationPipe } from '../validation.pipe';

jest
  .spyOn(classTransformer, 'plainToClass')
  .mockImplementation((_: any, value: string) => {
    if (value === 'valid') {
      return {
        isValid: true,
      };
    }

    return {
      isValid: false,
    };
  });

jest
  .spyOn(classValidator, 'validate')
  .mockImplementation(({ isValid }: any): any => {
    if (isValid) {
      return [];
    }

    return [
      {
        property: 'prop1',
        constraints: 'constraints1',
      },
      {
        property: 'prop2',
        constraints: 'constraints2',
      },
    ];
  });

describe('ValidationPipe', () => {
  let validationPipe: ValidationPipe;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationPipe],
    }).compile();

    validationPipe = module.get<ValidationPipe>(ValidationPipe);
  });

  describe('transform', () => {
    it('returns value if validation is passed successfully', async () => {
      const result = await validationPipe.transform('valid', {
        metatype: 'metatype',
        type: 'body',
      } as any);

      expect(result).toBe('valid');
    });

    it('returns value if matadata type is custom', async () => {
      const result = await validationPipe.transform('value', {
        metatype: 'metatype',
        type: 'custom',
      } as any);

      expect(result).toBe('value');
    });

    it('throws an error if value is not valid', async () => {
      await expect(
        validationPipe.transform('notValid', {
          metatype: 'metatype',
          type: 'body',
        } as any),
      ).rejects.toThrowError(
        JSON.stringify({
          prop1: 'constraints1',
          prop2: 'constraints2',
        }),
      );
    });
  });
});
