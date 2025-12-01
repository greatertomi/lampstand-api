import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'user_push_tokens' })
export class UserPushTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.pushTokens, { onDelete: 'CASCADE', nullable: true })
  user: UserEntity;

  @Column({ unique: true })
  pushToken: string;

  @Column()
  platform: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
