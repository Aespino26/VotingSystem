import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(studentId: string, password: string) {
    const user = await this.usersService.findByStudentId(studentId);
    if (!user) {
      return null;
    }

    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async register(studentId: string, name: string, password: string) {
    const existing = await this.usersService.findByStudentId(studentId);
    if (existing) {
      throw new UnauthorizedException('Student ID already registered');
    }

    const user = await this.usersService.createStudent(studentId, name, password);
    const payload = { sub: user.id, studentId: user.studentId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(studentId: string, password: string) {
    const user = await this.validateUser(studentId, password);
    if (!user) {
      throw new UnauthorizedException('Invalid student ID or password');
    }

    const payload = { sub: user.id, studentId: user.studentId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        role: user.role,
      },
    };
  }
}
