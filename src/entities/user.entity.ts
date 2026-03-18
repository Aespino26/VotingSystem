import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from './vote.entity';

export type UserRole = 'student' | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  studentId: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'student' })
  role: UserRole;

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];
}
