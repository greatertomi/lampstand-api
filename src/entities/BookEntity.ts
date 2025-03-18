import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ReadingLogEntity } from './ReadingLogEntity';
import { UserEntity } from './UserEntity';

export enum BookFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  MOBI = 'mobi'
}

@Entity({ name: 'books' })
export class BookEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @ManyToOne(() => UserEntity, (user) => user.books, { onDelete: 'CASCADE' })
  owner: UserEntity;

  @Column({ type: 'text', nullable: true })
  cover: string;

  @Column({
    type: 'enum',
    enum: BookFormat
  })
  format: BookFormat;

  @Column('int')
  size: number;

  @Column()
  url: string;

  @OneToMany(() => ReadingLogEntity, (readingLog) => readingLog.book, { onDelete: 'CASCADE' })
  readingLogs: ReadingLogEntity[];
}
