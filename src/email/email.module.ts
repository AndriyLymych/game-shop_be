import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { LoggerModule } from '../logger/logger.module';

import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: process.env.MAILER_SERVICE,
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: true,
        auth: {
          user: process.env.MAILER_ADMIN_USER,
          pass: process.env.MAILER_ADMIN_PASSWORD,
        },
      },
      defaults: {
        from: `GAME LOAN 🎮 <${process.env.MAILER_ADMIN_USER}>`,
      },
      template: {
        dir: './src/emailTemplates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    LoggerModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
