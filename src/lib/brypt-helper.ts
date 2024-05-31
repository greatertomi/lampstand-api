import bcrypt from 'bcryptjs';

export const BcryptHelper = {
  async hash(password: string): Promise<string> {
    const saltRounds = 11;
    return bcrypt.hash(password, saltRounds);
  },

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
};
