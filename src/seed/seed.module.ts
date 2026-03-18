import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, CandidatesModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
