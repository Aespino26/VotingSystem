import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Candidate } from './candidate.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.votes, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Candidate, (candidate) => candidate.votes, { eager: true, onDelete: 'CASCADE' })
  candidate: Candidate;

  @CreateDateColumn()
  createdAt: Date;
}
