import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { testUser } from '../test-utils/test-data';

describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();
  const createRoute = '/auth/signup';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  describe('POST /Signup', () => {
    it('should register a new user successfully', async () => {
      const res = await factory.app.post(createRoute).send(testUser).expect(HTTP_STATUS.CREATED);

      expect(res.body).toHaveProperty('message', 'User created');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('fullName', testUser.fullName);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('should return an error if the user already exists', async () => {
      await factory.app.post(createRoute).send(testUser).expect(HTTP_STATUS.CREATED);

      const res = await factory.app.post(createRoute).send(testUser);

      expect(res.status).toEqual(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('email', 'Email address already in use');
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
      });
    });
  });
});
