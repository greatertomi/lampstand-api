import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './UserEntity';
import { BookEntity } from './BookEntity';

@Entity({ name: 'reading_logs' })
export class ReadingLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.readingLogs, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => BookEntity, book => book.readingLogs, { onDelete: 'CASCADE' })
  book: BookEntity;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  currentTime: Date;

  @Column('int')
  minutesRead: number;
}
