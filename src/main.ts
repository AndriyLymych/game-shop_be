import { NestFactory } from '@nestjs/core';
import { RootAdminHelper } from 'src/helpers/createRootAdmin.helper';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { FilesService } from './files/files.service';
import { LoggerService } from './logger/logger.service';
import { ValidationPipe } from './pipes/validation.pipe';
import { UsersService } from './users/users.service';

const start = async () => {
  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule);

  const createRootAdmin = new RootAdminHelper(
    app.get(UsersService),
    await app.resolve(LoggerService),
  );
  await createRootAdmin.create();
  await app.get(FilesService).createBucket();

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Game shop')
    .setDescription('The Game shop API description')
    .setVersion('1.0')
    .addTag('game_shop')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(PORT, async () => {
    // eslint-disable-next-line no-console
    console.log(
      '\x1b[4m\x1b[1m\x1b[36m',
      `Server is listening ${PORT} port...`,
    );
  });
};

start();
