import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BookEntity } from './BookEntity';
import { ReadingGoal } from './ReadingGoalEntity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  emailAddress: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  agreedToTerms: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BookEntity, book => book.owner, { onDelete: 'CASCADE' })
  books: BookEntity[];

  @OneToMany(() => ReadingGoal, readingGoal => readingGoal.user, { onDelete: 'CASCADE' })
  readingGoals: ReadingGoal[];
}
