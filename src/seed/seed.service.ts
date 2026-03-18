import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CandidatesService } from '../candidates/candidates.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly candidatesService: CandidatesService,
  ) {}

  async seed() {
    await this.seedAdmin();
    await this.seedDemoData();
  }

  private async seedAdmin() {
    const existingAdmin = await this.usersService.findByStudentId('admin');
    if (!existingAdmin) {
      this.logger.log('Seeding admin user (studentId=admin, password=admin)');
      await this.usersService.createAdmin('admin', 'Administrator', 'admin');
    }
  }

  private async seedDemoData() {
    const candidates = await this.candidatesService.findAll();
    if (candidates.length === 0) {
      this.logger.log('Seeding demo candidates');
      await this.candidatesService.create({ name: 'Alice Johnson', position: 'President', description: 'A dedicated leader focused on community and transparency.' });
      await this.candidatesService.create({ name: 'Brian Chen', position: 'President', description: 'A candidate with a passion for student voice and innovation.' });
      await this.candidatesService.create({ name: 'Chloe Martinez', position: 'Vice President', description: 'Committed to improving campus engagement and events.' });
      await this.candidatesService.create({ name: 'Daniel Kim', position: 'Vice President', description: 'Focused on fairness and accessibility for every student.' });
    }
  }
}
