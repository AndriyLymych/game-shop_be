import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

import { LoggerService } from '../../logger/logger.service';
import { ErrorExeptionFilter } from '../errorExeption.filter';

const loggerServiceMock = {
  error: jest.fn(),
};

describe('ErrorExeptionFilter', () => {
  let filter: ErrorExeptionFilter;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorExeptionFilter,
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    }).compile();

    filter = module.get<ErrorExeptionFilter>(ErrorExeptionFilter);
  });

  describe('catch', () => {
    it('catches and log an HttpException', () => {
      const mockHost = {
        switchToHttp: () => ({
          getRequest: () =>
            ({
              url: '/test',
            }) as Request,
          getResponse: () =>
            ({
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
            }) as any,
        }),
      };

      const mockException = new HttpException(
        'Test exception',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(mockException, mockHost as any);

      expect(loggerServiceMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test exception',
          trace: expect.stringContaining('HttpException: Test exception'),
          context: {
            service: 'Promise.then',
            method: 'completed',
          },
        }),
      );
    });

    it('catches and log a generic exception', () => {
      const mockHost = {
        switchToHttp: () => ({
          getRequest: () =>
            ({
              url: '/test',
            }) as Request,
          getResponse: () =>
            ({
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
            }) as any,
        }),
      };

      const mockException = new Error('Generic error');

      filter.catch(mockException as any, mockHost as any);

      expect(loggerServiceMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Generic error',
          trace: expect.stringContaining('Error: Generic error'),
          context: {
            service: 'Promise.then',
            method: 'completed',
          },
        }),
      );
    });
  });
});
