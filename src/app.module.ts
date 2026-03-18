import { Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidatesModule } from './candidates/candidates.module';
import { VotesModule } from './votes/votes.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { User } from './entities/user.entity';
import { Candidate } from './entities/candidate.entity';
import { Vote } from './entities/vote.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? 'data/voting.sqlite',
      synchronize: true,
      logging: false,
      entities: [User, Candidate, Vote],
    }),
    AuthModule,
    UsersModule,
    CandidatesModule,
    VotesModule,
    SeedModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
