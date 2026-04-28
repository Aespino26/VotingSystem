import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidatesRepository: Repository<Candidate>,
  ) {}

  findAll(): Promise<Candidate[]> {
    return this.candidatesRepository.find({ order: { position: 'ASC', name: 'ASC' } });
  }

  async findOne(id: number): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    return candidate;
  }

  async create(input: Partial<Candidate>): Promise<Candidate> {
    const candidate = this.candidatesRepository.create(this.cleanInput(input));
    return this.candidatesRepository.save(candidate);
  }

  async update(id: number, input: Partial<Candidate>): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, this.cleanInput(input));
    return this.candidatesRepository.save(candidate);
  }

  async remove(id: number): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidatesRepository.remove(candidate);
  }

  private cleanInput(input: Partial<Candidate>): Partial<Candidate> {
    return Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<Candidate>;
  }
}
