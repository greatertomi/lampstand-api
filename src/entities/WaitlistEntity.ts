import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_waitlist' })
export class WaitlistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  isVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
