import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadUserAvatarDto {
  @ApiProperty({
    example: '1',
    description: 'User id',
  })
  @IsString()
  @IsDefined()
  readonly userId: string;
}
