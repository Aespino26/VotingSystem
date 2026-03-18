import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import { UsersService } from '../users/users.service';
import { CandidatesService } from '../candidates/candidates.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    private readonly usersService: UsersService,
    private readonly candidatesService: CandidatesService,
  ) {}

  async vote(studentId: string, candidateId: number) {
    const user = await this.usersService.findByStudentId(studentId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const candidate = await this.candidatesService.findOne(candidateId);

    // Ensure the user has not already voted for this position
    const existing = await this.votesRepository
      .createQueryBuilder('vote')
      .leftJoin('vote.candidate', 'candidate')
      .leftJoin('vote.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('candidate.position = :position', { position: candidate.position })
      .getOne();

    if (existing) {
      throw new BadRequestException('You have already voted for this position');
    }

    const vote = this.votesRepository.create({ user, candidate });
    return this.votesRepository.save(vote);
  }

  async getMyVotes(studentId: string) {
    const user = await this.usersService.findByStudentId(studentId);
    if (!user) {
      return [];
    }
    return this.votesRepository.find({ where: { user: { id: user.id } }, relations: ['candidate'] });
  }

  async getResults() {
    const raw = await this.votesRepository
      .createQueryBuilder('vote')
      .select('vote.candidateId', 'candidateId')
      .addSelect('candidate.position', 'position')
      .addSelect('candidate.name', 'name')
      .addSelect('COUNT(vote.id)', 'votes')
      .leftJoin('vote.candidate', 'candidate')
      .groupBy('vote.candidateId')
      .addGroupBy('candidate.position')
      .addGroupBy('candidate.name')
      .orderBy('candidate.position', 'ASC')
      .addOrderBy('votes', 'DESC')
      .getRawMany();

    return raw.map((r) => ({
      candidateId: Number(r.candidateId),
      position: r.position,
      name: r.name,
      votes: Number(r.votes),
    }));
  }
}
