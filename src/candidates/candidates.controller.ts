import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() body: { name: string; description?: string; position: string }) {
    return this.candidatesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string; position?: string },
  ) {
    return this.candidatesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.remove(id);
  }
}
