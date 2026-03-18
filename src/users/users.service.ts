import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByStudentId(studentId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { studentId } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createStudent(studentId: string, name: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ studentId, name, passwordHash, role: 'student' });
    return this.usersRepository.save(user);
  }

  async createAdmin(studentId: string, name: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ studentId, name, passwordHash, role: 'admin' as UserRole });
    return this.usersRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
