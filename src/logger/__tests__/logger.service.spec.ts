// logger.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import * as winston from 'winston';

import { LoggerDto } from '../dto/logger.dto';
import { LoggerService } from '../logger.service';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  const loggerDto = (type: string) =>
    ({
      message: `Log ${type}`,
      context: {
        service: 'service',
        method: 'method',
      },
      payload: {
        data: 'data',
      },
    }) as LoggerDto;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    loggerService = await module.resolve<LoggerService>(LoggerService);
  });

  const loggerMock = jest.spyOn(winston, 'createLogger').mockReturnValue({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  } as unknown as winston.Logger);

  describe('error', () => {
    it('logs error successfully', async () => {
      await loggerService.error(loggerDto('error'));

      expect(loggerMock.mock.calls.length).toBe(1);
      expect(loggerMock.mock.results[0].value.error).toHaveBeenCalledWith(
        'Log error',
        {
          context: { method: 'method', service: 'service' },
          payload: { data: 'data' },
          trace: undefined,
        },
      );
    });
  });

  describe('warn', () => {
    it('logs warning successfully', async () => {
      await loggerService.warn(loggerDto('warning'));

      expect(loggerMock.mock.calls.length).toBe(1);
      expect(loggerMock.mock.results[0].value.warn).toHaveBeenCalledWith(
        'Log warning',
        {
          context: { method: 'method', service: 'service' },
          payload: { data: 'data' },
        },
      );
    });
  });

  describe('info', () => {
    it('logs info successfully', async () => {
      await loggerService.info(loggerDto('info'));

      expect(loggerMock.mock.calls.length).toBe(1);
      expect(loggerMock.mock.results[0].value.info).toHaveBeenCalledWith(
        'Log info',
        {
          context: { method: 'method', service: 'service' },
          payload: { data: 'data' },
        },
      );
    });
  });

  describe('debug', () => {
    it('logs debug successfully', async () => {
      await loggerService.debug(loggerDto('debug'));

      expect(loggerMock.mock.calls.length).toBe(1);
      expect(loggerMock.mock.results[0].value.debug).toHaveBeenCalledWith(
        'Log debug',
        {
          context: { method: 'method', service: 'service' },
          payload: { data: 'data' },
        },
      );
    });
  });
});
