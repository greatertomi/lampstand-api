import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BookEntity } from './BookEntity';
import { UserEntity } from './UserEntity';

@Entity({ name: 'reading_logs' })
export class ReadingLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.readingLogs, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => BookEntity, (book) => book.readingLogs, { onDelete: 'CASCADE' })
  book: BookEntity;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('int')
  secondsRead: number;
}
