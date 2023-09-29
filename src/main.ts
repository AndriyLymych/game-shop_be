import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const start = async () => {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3000);
};

start();
