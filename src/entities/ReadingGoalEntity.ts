import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity()
@Unique(['user'])
export class ReadingGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.readingGoals, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column('int')
  goalInMinutes: number;

  @Column('time')
  reminderTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
