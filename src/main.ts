import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const start = async () => {
  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule, { cors: true });

  await app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is listening ${PORT} port...`);
  });
};

start();
