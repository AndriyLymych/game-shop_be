import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRolesEnum } from '../constants/roles';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string | null;

  @Column()
  role: UserRolesEnum;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn({})
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
