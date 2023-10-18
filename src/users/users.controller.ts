import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesEnum } from '../constants/files';
import { UserRolesEnum } from '../constants/roles';

import { CreateUserDto } from './dto/createUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() userDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: FilesEnum.MAX_SIZE,
          message: `Unable to upload user avatar with size more then ${
            FilesEnum.MAX_SIZE / (1024 * 1024)
          } mb`,
        })
        .addFileTypeValidator({ fileType: /(jpeg|gif|png)/ })
        .build({ fileIsRequired: false }),
    )
    avatar: Express.Multer.File,
  ): void {
    const user = { ...userDto, role: UserRolesEnum.USER };

    this.usersService.create(user, avatar);
  }
}
