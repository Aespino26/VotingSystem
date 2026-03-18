import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async vote(@Req() req: any, @Body() body: { candidateId: number }) {
    const user = req.user;
    return this.votesService.vote(user.studentId, body.candidateId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myVotes(@Req() req: any) {
    const user = req.user;
    return this.votesService.getMyVotes(user.studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('results')
  async results() {
    return this.votesService.getResults();
  }
}
