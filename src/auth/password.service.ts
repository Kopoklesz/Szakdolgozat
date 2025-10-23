import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Jelszó hash-elése bcrypt-tel
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Jelszó ellenőrzése hash-elt verzióval
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Jelszó komplexitás validáció - SZINKRONIZÁLVA A FRONTEND-DEL
   * Minimum 8 karakter, 1+ nagybetű, 1+ kisbetű, 1+ szám, 1+ speciális karakter
   */
  validatePasswordComplexity(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('A jelszónak legalább 8 karakter hosszúnak kell lennie');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell legalább egy nagybetűt');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell legalább egy kisbetűt');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell legalább egy számot');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell legalább egy speciális karaktert (!@#$%^&*(),.?":{}|<>)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Email domain alapú szerepkör meghatározás
   * MÓDOSÍTVA: Csak @student.uni-pannon.hu, @teacher.uni-pannon.hu és admin@uni-pannon.hu engedélyezett
   */
  determineRoleFromEmail(email: string): 'student' | 'teacher' | 'admin' {
    // Speciális admin eset
    if (email === 'admin@uni-pannon.hu') {
      return 'admin';
    }

    // Hallgató
    if (email.endsWith('@student.uni-pannon.hu')) {
      return 'student';
    }

    // Tanár
    if (email.endsWith('@teacher.uni-pannon.hu')) {
      return 'teacher';
    }

    // Minden más email elutasítása
    throw new BadRequestException(
      'Csak @student.uni-pannon.hu vagy @teacher.uni-pannon.hu email címmel lehet regisztrálni'
    );
  }

  /**
   * Email domain validáció - SZINKRONIZÁLVA A FRONTEND-DEL
   * MÓDOSÍTVA: Csak egyetemi domaineket fogadunk el
   */
  validateEmailDomain(email: string): { isValid: boolean; error?: string } {
    // Admin email engedélyezése
    if (email === 'admin@uni-pannon.hu') {
      return { isValid: true };
    }

    // Csak student és teacher domaineket fogadunk el
    const validDomains = ['@student.uni-pannon.hu', '@teacher.uni-pannon.hu'];
    const isValid = validDomains.some(domain => email.endsWith(domain));

    if (!isValid) {
      return {
        isValid: false,
        error: 'Csak @student.uni-pannon.hu vagy @teacher.uni-pannon.hu email címmel lehet regisztrálni'
      };
    }

    return { isValid: true };
  }
}