import { BcryptHelper } from '../../src/lib';

describe('Testing the bcrypt helper', () => {
  it('should hash a password', async () => {
    const password = 'password';
    const hashedPassword = await BcryptHelper.hash(password);
    expect(hashedPassword).not.toEqual(password);
    expect(typeof hashedPassword).toBe('string');
  });

  it('should return true if the password matches the hashed password', async () => {
    const password = 'password';
    const hashedPassword = await BcryptHelper.hash(password);
    const isMatch = await BcryptHelper.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false if the password does not match the hashed password', async () => {
    const password = 'password';
    const wrongPassword = 'wrongpassword';
    const hashedPassword = await BcryptHelper.hash(password);
    const isMatch = await BcryptHelper.compare(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});
