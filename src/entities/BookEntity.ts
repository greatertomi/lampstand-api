import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

export enum BookFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  MOBI = 'mobi'
}

@Entity({ name: 'books' })
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @ManyToOne(() => UserEntity, user => user.books)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @Column('text')
  cover: string;

  @Column({
    type: 'enum',
    enum: BookFormat,
  })
  format: BookFormat;

  @Column('jsonb', { nullable: true })
  metadata: object;

  @Column('jsonb', { nullable: true })
  manifest: object;

  @Column('int')
  size: number;

  @Column()
  url: string;
}
