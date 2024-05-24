import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable:false })
  fullName: string;

  @Column({ nullable:false, unique:true })
  emailAddress: string;

  @Column({ nullable:false })
  password:string;

  @Column({ nullable:true })
  phoneNumber?:string;
  
  @Column({ nullable:false, default:false })
  agreedToTerms:boolean = false;

  @Column({ nullable:false, default:false })
  isEmailVerified:boolean = false;

  @CreateDateColumn()
  createdAt: Date;
  
  @CreateDateColumn()
  updatedAt: Date;
}
