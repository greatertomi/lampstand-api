import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './UserEntity';
import { BookEntity } from './BookEntity';

@Entity({ name: 'reading_logs' })
export class ReadingLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.readingLogs)
  user: UserEntity;

  @ManyToOne(() => BookEntity, book => book.readingLogs)
  book: BookEntity;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  currentTime: Date;

  @Column('int')
  minutesRead: number;
}
