import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserRolesEnum } from '../constants/roles';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Jon', description: 'User name' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Snow', description: 'User surname' })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'Arthur@Morgan',
    description: 'Unique user nickname',
  })
  @Column({ unique: true })
  nickname: string;

  @ApiProperty({ example: 'user@gmail.com', description: 'Unique user email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'some_Pa$$w0rd', description: 'User password' })
  @Column()
  password: string;

  @ApiProperty({ example: 'http://....', description: 'User avatar src' })
  @Column({ nullable: true })
  avatar: string | null;

  @ApiProperty({ example: UserRolesEnum.USER, description: 'User role' })
  @Column()
  role: UserRolesEnum;

  @ApiProperty({ example: false, description: 'User activation status' })
  @Column({ default: false })
  isActive: boolean;

  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn({})
  createdAt: Date;

  @ApiProperty({ description: 'User update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
