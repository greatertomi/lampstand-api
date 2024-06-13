import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import * as sendEmailService from '../../services/sendemail';
import { TestFactory } from '../factory';
import { testUser } from '../test-utils/test-data';

describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();
  const createRoute = '/auth/signup';
  let sendVerificationEmail: jest.SpyInstance;

  beforeEach((done) => {
    factory.init().then(done);
    sendVerificationEmail = jest.spyOn(sendEmailService, 'sendVerificationEmail');
    sendVerificationEmail.mockImplementation(() => Promise.resolve());
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
        expect(res.body.errors.password).toBe('Password must have at least one special character');
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
          'Password must have at least one special character'
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
});
