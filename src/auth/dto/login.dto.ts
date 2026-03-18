import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  studentId: string;

  @IsString()
  @MinLength(4)
  password: string;
}
