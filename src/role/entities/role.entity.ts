import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum RoleType {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MANAGER = 'manager', 
}

const rolePermissions = {
  user: ['read:profile', 'update:own-profile'],
  moderator: ['read:users', 'moderate:content'],
  admin: ['*']
};

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}