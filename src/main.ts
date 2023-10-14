import { NestFactory } from '@nestjs/core';
import { RootAdminHelper } from 'src/helpers/createRootAdmin.helper';

import { AppModule } from './app.module';
import { FilesService } from './files/files.service';
import { UsersService } from './users/users.service';

const start = async () => {
  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule);

  const createRootAdmin = new RootAdminHelper(app.get(UsersService));

  await createRootAdmin.create();

  await app.get(FilesService).createBucket();

  await app.listen(PORT, async () => {
    // eslint-disable-next-line no-console
    console.log(
      '\x1b[4m\x1b[1m\x1b[36m',
      `Server is listening ${PORT} port...`,
    );
  });
};

start();
