import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';

import { LoggerService } from '../../logger/logger.service';
import { EmailService } from '../../email/email.service';
import { EmailDto } from '../dto/email.dto';

const loggerServiceMock = {
  info: jest.fn(),
};

const mailerServiceMock = {
  sendMail: jest.fn(),
};

describe('EmailService', () => {
  let emailService: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mailerServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  describe('sendEmail', () => {
    const oldEnv = process.env.FRONTEND_URL;

    beforeAll(() => {
      process.env.FRONTEND_URL = 'http://test.com';
    });

    it('sends email successfully', async () => {
      const emailDto: EmailDto = {
        email: 'test@example.com',
        subject: 'Test Subject',
        template: 'test-template',
        context: { data: 'test' },
      };

      await emailService.sendEmail(emailDto);

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
        to: emailDto.email,
        subject: emailDto.subject,
        template: emailDto.template,
        context: {
          ...emailDto.context,
          frontendUrl: process.env.FRONTEND_URL,
        },
      });

      expect(loggerServiceMock.info).toHaveBeenCalledWith({
        message: 'Email is successfully sent',
        context: {
          service: EmailService.name,
          method: 'sendEmail',
        },
        payload: {
          receiver: emailDto.email,
          subject: emailDto.subject,
          template: emailDto.template,
          context: {
            ...emailDto.context,
            frontendUrl: process.env.FRONTEND_URL,
          },
        },
      });
    });

    afterAll(() => {
      process.env.FRONTEND_URL = oldEnv;
    });
  });
});
