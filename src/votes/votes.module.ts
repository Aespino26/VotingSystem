import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from '../entities/vote.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { UsersModule } from '../users/users.module';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vote]), UsersModule, CandidatesModule],
  providers: [VotesService],
  controllers: [VotesController],
})
export class VotesModule {}
