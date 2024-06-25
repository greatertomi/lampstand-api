import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false })

  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'bigint', nullable: false })
  token: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'used'],
    default: 'active',
    nullable: false
  })
  status: 'active' | 'expired' | 'used';
}
