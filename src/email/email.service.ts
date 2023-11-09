import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { LoggerService } from '../logger/logger.service';

import { EmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private logger: LoggerService,
  ) {}

  async sendEmail({ email, subject, template, context }: EmailDto) {
    const extendedContext = {
      ...context,
      frontendUrl: process.env.FRONTEND_URL,
    };

    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: extendedContext,
    });

    this.logger.info({
      message: 'Email is successfully sent',
      context: {
        service: EmailService.name,
        method: this.sendEmail.name,
      },
      payload: {
        receiver: email,
        subject,
        template,
        context: extendedContext,
      },
    });
  }
}
