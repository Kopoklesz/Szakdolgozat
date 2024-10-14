import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../entity/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}