import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('login_history')
export class LoginHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.loginHistory)
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['OAuth', 'Password'],
  })
  loginType: 'OAuth' | 'Password';

  @CreateDateColumn()
  createdAt: Date;
}
