import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { BookEntity } from './BookEntity';
import { LoginHistoryEntity } from './LoginHistoryEntity';
import { PasswordResetTokenEntity } from './PasswordResetTokenEntity';
import { ReadingGoal } from './ReadingGoalEntity';
import { ReadingLogEntity } from './ReadingLogEntity';
import { UserPushTokenEntity } from './UserPushTokenEntity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  agreedToTerms: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isOAuthUser: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BookEntity, (book) => book.owner, { onDelete: 'CASCADE' })
  books: BookEntity[];

  @OneToMany(() => ReadingGoal, (readingGoal) => readingGoal.user, { onDelete: 'CASCADE' })
  readingGoals: ReadingGoal[];

  @OneToMany(() => ReadingLogEntity, (readingLog) => readingLog.user, { onDelete: 'CASCADE' })
  readingLogs: ReadingLogEntity[];

  @OneToMany(() => LoginHistoryEntity, (loginHistory) => loginHistory.user, { onDelete: 'CASCADE' })
  loginHistories: LoginHistoryEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (token) => token.user, { onDelete: 'CASCADE' })
  passwordResetTokens: PasswordResetTokenEntity[];

  @OneToMany(() => UserPushTokenEntity, (token) => token.user, { onDelete: 'CASCADE' })
  pushTokens: UserPushTokenEntity[];
}
