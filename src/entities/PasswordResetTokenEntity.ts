import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TokenStatus } from './types';
import { UserEntity } from './UserEntity';

@Entity('password_reset_tokens')
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'integer' })
  token: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @Column({
    type: 'enum',
    enum: TokenStatus,
    default: TokenStatus.ACTIVE
  })
  status: TokenStatus;
}

