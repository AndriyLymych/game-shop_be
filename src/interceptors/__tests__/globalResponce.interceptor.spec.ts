import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { LoggerService } from '../../logger/logger.service';
import { GlobalResponseInterceptor } from '../globalResponse.interceptor';

const loggerServiceMock = {
  info: jest.fn(),
};

describe('GlobalResponseInterceptor', () => {
  let interceptor: GlobalResponseInterceptor;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalResponseInterceptor,
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    }).compile();

    interceptor = module.get<GlobalResponseInterceptor>(
      GlobalResponseInterceptor,
    );
  });

  describe('intercept', () => {
    it('intercepts and log the response with a different status code', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/test',
          }),
          getResponse: () => ({
            statusCode: 404,
          }),
        }),
        getClass: () => ({
          name: 'TestService',
        }),
        getHandler: () => ({
          name: 'testMethod',
        }),
      };

      const mockCallHandler = {
        handle: () => of('testData'),
      };

      interceptor
        .intercept(mockContext as any, mockCallHandler)
        .subscribe((result) => {
          expect(result).toEqual({
            data: 'testData',
            statusCode: 404,
            timestamp: expect.any(String),
            path: '/test',
          });

          expect(loggerServiceMock.info).toHaveBeenCalledWith({
            message:
              'Method testMethod in TestService service is succussfully completed',
            context: {
              service: 'TestService',
              method: 'testMethod',
            },
            payload: result,
          });
        });
    });

    it('intercepts and log the response when data is null', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/test',
          }),
          getResponse: () => ({
            statusCode: 200,
          }),
        }),
        getClass: () => ({
          name: 'TestService',
        }),
        getHandler: () => ({
          name: 'testMethod',
        }),
      };

      const mockCallHandler = {
        handle: () => of(null),
      };

      interceptor
        .intercept(mockContext as any, mockCallHandler)
        .subscribe((result) => {
          expect(result).toEqual({
            data: null,
            statusCode: 200,
            timestamp: expect.any(String),
            path: '/test',
          });

          expect(loggerServiceMock.info).toHaveBeenCalledWith({
            message:
              'Method testMethod in TestService service is succussfully completed',
            context: {
              service: 'TestService',
              method: 'testMethod',
            },
            payload: result,
          });
        });
    });
  });
});
