import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

export enum LoginType {
  OAUTH = 'Oauth',
  PASSWORD = 'Password'
}

@Entity({ name:'login_histories' })
export class LoginHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.loginHistories, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'enum', enum: LoginType })
  loginType: LoginType;

  @CreateDateColumn()
  loginAt: Date;
}
