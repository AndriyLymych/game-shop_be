import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';

import { FilesService } from './files.service';

@Module({
  imports: [LoggerModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FileModule {}
