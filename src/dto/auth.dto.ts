import { IsNotEmpty, IsEmail, IsString, Length, Matches } from 'class-validator';

// Regisztrációs DTO
export class RegisterDto {
  @IsNotEmpty({ message: 'A Neptune kód megadása kötelező' })
  @IsString()
  @Length(6, 6, { message: 'A Neptune kódnak pontosan 6 karakter hosszúnak kell lennie' })
  @Matches(/^[A-Z0-9]{6}$/, { message: 'A Neptune kód csak nagybetűket és számokat tartalmazhat' })
  username: string;

  @IsNotEmpty({ message: 'Az email cím megadása kötelező' })
  @IsEmail({}, { message: 'Érvényes email címet adj meg' })
  email: string;

  @IsNotEmpty({ message: 'A jelszó megadása kötelező' })
  @IsString()
  password: string;
}

// Bejelentkezési DTO
export class LoginDto {
  @IsNotEmpty({ message: 'A felhasználónév vagy email megadása kötelező' })
  @IsString()
  identifier: string; // lehet username vagy email

  @IsNotEmpty({ message: 'A jelszó megadása kötelező' })
  @IsString()
  password: string;
}

// Felhasználó létrehozási DTO (belső használatra)
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  role?: 'student' | 'teacher' | 'admin';
}

// Jelszó változtatási DTO
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'A jelenlegi jelszó megadása kötelező' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'Az új jelszó megadása kötelező' })
  @IsString()
  newPassword: string;
}

// Felhasználói válasz DTO (jelszó nélkül)
export class UserResponseDto {
  user_id: number;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: Date;
}

// JWT payload interface
export interface JwtPayload {
  sub: number; // user_id
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

// Bejelentkezési válasz DTO
export class LoginResponseDto {
  access_token: string;
  user: UserResponseDto;
}