import bcrypt from 'bcryptjs';

export const HTTP_ERRORS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};



const BcryptHelper = {
  async hash(password: string): Promise<string> {
    const saltRounds = 11; // Increased salt rounds from 10 to 11
    return bcrypt.hash(password, saltRounds);
  },

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  },
};

export default BcryptHelper;
