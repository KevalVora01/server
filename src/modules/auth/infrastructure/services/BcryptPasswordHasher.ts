import bcrypt from "bcrypt";

import { IPasswordHasher } from "../../domain/services/IPasswordHasher";

export class BcryptPasswordHasher
  implements IPasswordHasher
{
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      this.saltRounds
    );
  }

  async compare(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(
      plainPassword,
      hashedPassword
    );
  }
} 