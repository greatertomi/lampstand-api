import bcrypt from 'bcryptjs';

export const BcryptHelper = {
  hash: async (password: string): Promise<string> => {
    const saltRounds = 11;
    return bcrypt.hash(password, saltRounds);
  },

  compare: async (password: string, hashedPassword: string): Promise<boolean> =>
    bcrypt.compare(password, hashedPassword)
};
