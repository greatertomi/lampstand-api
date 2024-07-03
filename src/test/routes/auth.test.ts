import { PasswordResetTokenEntity } from '../../entities';
import { TokenStatus } from '../../entities/types';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import * as sendEmailService from '../../services/sendemail';
import { TestFactory } from '../factory';
import { createTestUser } from '../test-utils/helper-test';
import { testUser } from '../test-utils/test-data';

jest.mock('../../services', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

const passwordError = 'Password must have at least one special character';
const resetPassword = "'newPassword123@'";
describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();
  const createRoute = '/auth/signup';
  const loginRoute = '/auth/login';
  const resetRoute = '/auth/reset-password';
  const updatePasswordRoute = '/auth/update-password';
  let sendVerificationEmail: jest.SpyInstance;
  const verifyTokenRoute = '/auth/verify-reset-token';
  let sendPasswordResetEmail: jest.SpyInstance;

  beforeEach((done) => {
    factory.init().then(done);
    sendVerificationEmail = jest.spyOn(sendEmailService, 'sendVerificationEmail');
    sendVerificationEmail.mockImplementation(() => Promise.resolve());
    sendPasswordResetEmail = jest.spyOn(sendEmailService, 'sendPasswordResetEmail');
    sendPasswordResetEmail.mockImplementation(() => Promise.resolve());
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });

  describe('POST /Signup', () => {
    it('should register a new user successfully', async () => {
      const res = await factory.app.post(createRoute).send(testUser).expect(HTTP_STATUS.CREATED);

      expect(res.body).toHaveProperty('message', 'User created');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('fullName', testUser.fullName);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(sendVerificationEmail).toHaveBeenCalledWith(testUser.email, expect.any(String));
    });

    it('should return an error if the user already exists', async () => {
      await factory.app.post(createRoute).send(testUser).expect(HTTP_STATUS.CREATED);

      const res = await factory.app.post(createRoute).send(testUser);

      expect(res.status).toEqual(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('message', 'Email address already in use');
      expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    describe('should return an error if submitted data has missing values', () => {
      it('should return an error if only full name is provided', async () => {
        const res = await factory.app.post(createRoute).send({
          fullName: testUser.fullName
        });

        expect(res.status).toEqual(HTTP_STATUS.UNPROCESSABLE_ENTITY);
        expect(Object.keys(res.body.errors).length).toBe(3);
        expect(res.body.errors.password).toBe(passwordError);
        expect(res.body.errors.agreedToTerms).toBe('Agreed to terms should be a boolean');
        expect(sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should return an error if email and agreedToTerms is invalid', async () => {
        const invalidData = {
          ...testUser,
          email: 'john',
          agreedToTerms: 'yes'
        };

        const response = await factory.app
          .post(createRoute)
          .send(invalidData)
          .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveProperty('email', 'This must be a proper email address');
        expect(response.body.errors).toHaveProperty(
          'agreedToTerms',
          'Agreed to terms should be a boolean'
        );
        expect(sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should return an error if the password is weak', async () => {
        const PasswordData = {
          ...testUser,
          password: 'password'
        };

        const res = await factory.app
          .post(createRoute)
          .send(PasswordData)
          .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).toHaveProperty('password');

        const passwordErrorMessage = res.body.errors.password;
        const expectedErrorMessages = [
          'Password must be at least 8 characters long',
          'Password must have at least one uppercase letter',
          'Password must have at least one number',
          passwordError
        ];

        expect(expectedErrorMessages).toContain(passwordErrorMessage);
        expect(sendVerificationEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('GET /verify-email', () => {
    it('should verify a user email successfully', async () => {
      const res1 = await factory.app.post(createRoute).send(testUser);
      expect(res1.status).toEqual(HTTP_STATUS.CREATED);
      const userId = res1.body.data.id;

      const token = JwtHelper.generateToken(userId);
      const res2 = await factory.app.get(`/auth/verify-email?token=${token}`);

      expect(res2.status).toEqual(HTTP_STATUS.OK);
      expect(res2.body).toHaveProperty('message', 'Email verified successfully');
      expect(res2.body.data).toEqual({ userId });
    });

    it('should return an error if the user does not exist', async () => {
      const res = await factory.app.get('/auth/verify-email?token=invalid-token');
      expect(res.status).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /login', () => {
    it('should return a token when the request data is valid', async () => {
      const { user, password } = await createTestUser(factory);

      const response = await factory.app.post(loginRoute).send({
        email: user.email,
        password
      });

      expect(response.status).toEqual(HTTP_STATUS.OK);
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toMatchObject({
        id: user.id,
        fullName: user.fullName,
        email: user.email
      });
    });

    it('should return an error when the login credentials are invalid', async () => {
      const responseEmailNotFound = await factory.app.post(loginRoute).send({
        email: 'abc@gmail.com',
        password: 'pass12345@P'
      });
      expect(responseEmailNotFound.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(responseEmailNotFound.body.errors[0]).toHaveProperty(
        'message',
        'Invalid login credentials'
      );

      const { user } = await createTestUser(factory);
      const responseIncorrectPassword = await factory.app.post(loginRoute).send({
        email: user.email,
        password: 'wrongPassword12345@P'
      });
      expect(responseIncorrectPassword.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(responseIncorrectPassword.body.errors[0]).toHaveProperty(
        'message',
        'Invalid login credentials'
      );
    });

    it('should return an error when login data is invalid', async () => {
      const response = await factory.app.post(loginRoute).send({
        email: 'abc@gmail',
        password: 'wrongPassword'
      });
      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toStrictEqual({
        email: 'This must be a valid email address',
        password: passwordError
      });
    });
  });

  describe('POST /reset-password', () => {
    it('should send a password reset email successfully', async () => {
      const { user } = await createTestUser(factory);

      const res = await factory.app.post(resetRoute).send({ email: user.email });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toMatchObject({
        success: true,
        message: 'A 6-digit code has been sent to your email address',
        data: { userId: user.id, email: user.email }
      });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(user.email, expect.any(Number));
      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the email is not found', async () => {
      const res = await factory.app.post(resetRoute).send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(res.body.errors[0]).toHaveProperty('message', 'Email not found');
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should throw an error if the email is invalid', async () => {
      const res = await factory.app.post(resetRoute).send({ email: 'invalid-email' });

      expect(res.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(res.body.errors).toHaveProperty('email', 'This must be a valid email address');
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('POST /verify-reset-token', () => {
    it('should verify a valid reset token successfully', async () => {
      const { user } = await createTestUser(factory);

      // todo: mock this token storage
      const tokenRepository = factory._connection.getRepository(PasswordResetTokenEntity);
      const token = tokenRepository.create({
        token: 123_456,
        expiresAt: new Date(Date.now() + 3_600_000),
        status: TokenStatus.ACTIVE,
        user
      });
      await tokenRepository.save(token);

      const res = await factory.app
        .post(verifyTokenRoute)
        .send({ token: '123456', userId: user.id });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toEqual({ success: true });
    });

    it('should return an error for an invalid token format', async () => {
      const { user } = await createTestUser(factory);

      const res = await factory.app
        .post(verifyTokenRoute)
        .send({ token: '12345', userId: user.id });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toEqual({
        errors: [{ message: 'Token must be a valid 6-digit number' }]
      });
    });

    it('should return an error for a non-existent token', async () => {
      const { user } = await createTestUser(factory);

      const res = await factory.app
        .post(verifyTokenRoute)
        .send({ token: '123456', userId: user.id });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toEqual({
        errors: [{ message: 'Invalid or expired token' }]
      });
    });

    it('should return an error for an expired token', async () => {
      const { user } = await createTestUser(factory);

      const tokenRepository = factory._connection.getRepository(PasswordResetTokenEntity);
      const token = tokenRepository.create({
        token: 123_456,
        expiresAt: new Date(Date.now() - 3_600_000),
        status: TokenStatus.ACTIVE,
        user: user
      });
      await tokenRepository.save(token);

      const res = await factory.app
        .post(verifyTokenRoute)
        .send({ token: '123456', userId: user.id });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toEqual({
        errors: [{ message: 'Token has expired' }]
      });
    });
  });

  describe('POST /update-password', () => {
    it('should update password successfully', async () => {
      const { user } = await createTestUser(factory);

      const passwordResetTokenRepository =
        factory._connection.getRepository(PasswordResetTokenEntity);
      const token = 123_456;

      const expiresAt = new Date(Date.now() + 3_600_000);

      await passwordResetTokenRepository.save({
        user,
        token,
        expiresAt,
        status: TokenStatus.ACTIVE
      });

      const newPassword = resetPassword;
      const confirmPassword = newPassword;

      const res = await factory.app
        .put(updatePasswordRoute)
        .send({ userId: user.id, password: newPassword, token, confirmPassword });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Password reset successfully'
      });

      const updatedToken = await passwordResetTokenRepository.findOne({
        where: { user: { id: user.id }, token }
      });
      expect(updatedToken?.status).toBe(TokenStatus.USED);
      expect(updatedToken?.usedAt).toBeDefined();
    });

    it('should return an error for non-existent token', async () => {
      const { user } = await createTestUser(factory);

      const res = await factory.app.put(updatePasswordRoute).send({
        userId: user.id,
        password: 'newPassword123@',
        token: 123_456,
        confirmPassword: 'newPassword123@'
      });

      expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(res.body.errors[0]).toHaveProperty(
        'message',
        'User with the provided token not found'
      );
    });

    it('should return an error for invalid password format', async () => {
      const { user } = await createTestUser(factory);

      const res = await factory.app
        .put(updatePasswordRoute)
        .send({ userId: user.id, password: 'weak', token: '12356' })
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('password');
    });
  });
});
