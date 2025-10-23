import { IsNotEmpty, IsEmail, IsString, Matches, MinLength } from 'class-validator';

// Regisztrációs DTO
export class RegisterDto {
  @IsNotEmpty({ message: 'A felhasználónév megadása kötelező' })
  @IsString()
  username: string; // MÓDOSÍTVA: Bármi lehet, nincs hossz megkötés

  @IsNotEmpty({ message: 'Az email cím megadása kötelező' })
  @IsEmail({}, { message: 'Érvényes email címet adj meg' })
  @Matches(
    /@(student|teacher)\.uni-pannon\.hu$|^admin@uni-pannon\.hu$/,
    { message: 'Csak @student.uni-pannon.hu vagy @teacher.uni-pannon.hu email címmel lehet regisztrálni' }
  )
  email: string; // MÓDOSÍTVA: Csak egyetemi domaineket fogadunk el

  @IsNotEmpty({ message: 'A jelszó megadása kötelező' })
  @IsString()
  @MinLength(8, { message: 'A jelszónak legalább 8 karakter hosszúnak kell lennie' })
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