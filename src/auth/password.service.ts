import { Injectable } from '@nestjs/common';
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
   * Neptune kód validáció
   * Pontosan 6 karakter, nagybetűk és számok
   */
  validateNeptuneCode(neptuneCode: string): { isValid: boolean; error?: string } {
    if (neptuneCode.length !== 6) {
      return { isValid: false, error: 'A Neptune kódnak pontosan 6 karakter hosszúnak kell lennie' };
    }

    if (!/^[A-Z0-9]{6}$/.test(neptuneCode)) {
      return { isValid: false, error: 'A Neptune kód csak nagybetűket és számokat tartalmazhat' };
    }

    return { isValid: true };
  }

  /**
   * Email domain alapú szerepkör meghatározás
   */
  determineRoleFromEmail(email: string): 'student' | 'teacher' | 'admin' {
    if (email.endsWith('@student.uni-pannon.hu')) {
      return 'student';
    } else if (email.endsWith('@teacher.uni-pannon.hu') || email.endsWith('@uni-pannon.hu')) {
      return 'teacher';
    } else if (email === 'admin@admin.com') {
      return 'admin';
    }
    // Alapértelmezett diák szerepkör
    return 'student';
  }

  /**
   * Email domain validáció - SZINKRONIZÁLVA A FRONTEND-DEL
   */
  validateEmailDomain(email: string): { isValid: boolean; error?: string } {
    const validDomains = [
      '@student.uni-pannon.hu',
      '@teacher.uni-pannon.hu',
      '@uni-pannon.hu',
      '@admin.com' // Admin email kivétel
    ];

    const isValidDomain = validDomains.some(domain => email.endsWith(domain));

    if (!isValidDomain) {
      return {
        isValid: false,
        error: 'Csak egyetemi email címekkel lehet regisztrálni (@student.uni-pannon.hu, @teacher.uni-pannon.hu vagy @uni-pannon.hu)'
      };
    }

    return { isValid: true };
  }
}