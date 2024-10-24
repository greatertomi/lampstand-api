import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BookEntity } from './BookEntity';
import { ReadingGoal } from './ReadingGoalEntity';
import { ReadingLogEntity } from './ReadingLogEntity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  emailAddress: string;

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

  @OneToMany(() => BookEntity, book => book.owner, { onDelete: 'CASCADE' })
  books: BookEntity[];

  @OneToMany(() => ReadingGoal, readingGoal => readingGoal.user, { onDelete: 'CASCADE' })
  readingGoals: ReadingGoal[];

  @OneToMany(() => ReadingLogEntity, readingLog => readingLog.user, { onDelete: 'CASCADE' })
  readingLogs: ReadingLogEntity[];
}
