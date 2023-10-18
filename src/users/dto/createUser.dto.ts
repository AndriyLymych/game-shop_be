import { IsString, IsDefined, IsEmail, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const EMAIL_REGUlAR_EXPRESSION =
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).{8,100}$/;

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Unique user email' })
  @IsString()
  @IsDefined()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'some_Pa$$w0rd', description: 'User password' })
  @IsString()
  @IsDefined()
  @Matches(EMAIL_REGUlAR_EXPRESSION, {
    message:
      'Your password must be between 8 and 100 characters long and include at least one digit, one uppercase letter, one lowercase letter, and one special character.',
  })
  readonly password: string;

  @ApiProperty({ example: 'Jon', description: 'User name' })
  @IsString()
  @IsDefined()
  @Length(2, 60)
  readonly firstName: string;

  @ApiProperty({ example: 'Snow', description: 'User surname' })
  @IsString()
  @IsDefined()
  @Length(2, 60)
  readonly lastName: string;

  @ApiProperty({
    example: 'Arthur@Morgan',
    description: 'Unique user nickname',
  })
  @IsString()
  @IsDefined()
  @Length(2, 60)
  readonly nickname: string;
}
