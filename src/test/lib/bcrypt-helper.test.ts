import { BcryptHelper } from '../../lib';

describe('Testing the bcrypt helper', () => {
  it('should hash a password', async () => {
    const password = 'password';
    const hashedPassword = await BcryptHelper.hash(password);
    expect(hashedPassword).not.toEqual(password);
    expect(typeof hashedPassword).toBe('string');
  });
});
