import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vote } from './vote.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Vote, (vote) => vote.candidate)
  votes: Vote[];
}
