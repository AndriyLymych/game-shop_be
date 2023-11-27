import {
  Param,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FILE_CATEGORY } from '../constants/fileFoldersCategory';
import { FilesEnum } from '../constants/files';

import { UploadUserAvatarDto } from './dto/uploadUserAvatar.dto';
import { FilesService, UploadFile } from './files.service';

@ApiTags('Users')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: HttpStatus.OK })
  @Post('/upload/avatar/:userId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  uploadUserAvatar(
    @Param() { userId }: UploadUserAvatarDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: FilesEnum.MAX_SIZE,
          message: `Unable to upload user avatar with size more then ${
            FilesEnum.MAX_SIZE / (1024 * 1024)
          } mb`,
        })
        .addFileTypeValidator({ fileType: /(jpeg|gif|png)/ })
        .build(),
    )
    avatar: Express.Multer.File,
  ): Promise<UploadFile> {
    return this.filesService.updateAvatar(avatar, FILE_CATEGORY.USERS, +userId);
  }
}
