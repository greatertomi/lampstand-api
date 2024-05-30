import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { UserEntity } from '../../entities';
import handleGetRepository from '../../utils/handleGetRepository';

describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  describe('POST /Signup', () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    describe('Signup endpoint testing', () => {

      it('should register a new user successfully', async () => {
        const userData = {
          fullName: 'David Brown',
          email: 'david.brown@email.com',
          // eslint-disable-next-line sonarjs/no-duplicate-string
          password: 'Str0ngP@ssw0rd!',
          agreedToTerms: true,
        };

        // eslint-disable-next-line sonarjs/no-duplicate-string
        const res = await factory.app.post('/auth/signup')
          .send(userData)
          .expect(201);

        expect(res.body).toHaveProperty('message', 'User created');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('fullName', userData.fullName);
        expect(res.body.data).toHaveProperty('email', userData.email);

      });
    });

    describe('check if user exist', () => {
      it('should return an error if the user already exists', async () => {

        const existingUser = new UserEntity();
        existingUser.fullName = 'John Doe';
        existingUser.emailAddress = 'john.doe@example.com';
        existingUser.password = 'Str0ngP@ssw0rd!';
        existingUser.agreedToTerms = true;
        const userRepository = handleGetRepository(UserEntity);
        await userRepository.save(existingUser);

        const userData = {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Str0ngP@ssw0rd!',
          agreedToTerms: true,
        };

        const res = await factory.app.post('/auth/signup')
          .send(userData)
          .expect(422);

        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).toHaveProperty('email', 'Email address already in use');
      });
    });
    describe('should return an error if submitted data has missing values', () => {
      it('should return an error if only full name is provided', async () => {
        const res = await factory.app.post('/auth/signup').send({
          fullName: 'John Doe'
        });

        expect(res.status).toEqual(HTTP_STATUS.UNPROCESSABLE_ENTITY);
        expect(Object.keys(res.body.errors).length).toBe(3);
        expect(res.body.errors.password).toBe('Password must have at least one special character');
        expect(res.body.errors.agreedToTerms).toBe('Agreed to terms should be a boolean');
      });

      describe('check errors for email and agreed to terms', () => {
        it('should return an error if email and agreedToTerms is invalid', async () => {
          const invalidData = {
            fullName: 'John Doe',
            email: 'john',
            password: 'Str0ngP@ssw0rd!',
            agreedToTerms: 'yes'
          };

          const response = await factory.app.post('/auth/signup')
            .send(invalidData)
            .expect(422);

          expect(response.body).toHaveProperty('errors');

          expect(response.body.errors).toHaveProperty('email', 'This must be a proper email address');

          expect(response.body.errors).toHaveProperty('agreedToTerms', 'Agreed to terms should be a boolean');
        });
      });

      describe('Check for weak password', () => {
        it('should return an error if the password is weak', async () => {
          const PasswordData = {
            fullName: 'John Doe',
            email: 'test@test.com',
            password: 'password',
            agreedToTerms: 'true',
          };

          const res = await factory.app.post('/auth/signup')
            .send(PasswordData)
            .expect(422);

          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toHaveProperty('password');

          const passwordErrorMessage = res.body.errors.password;
          const expectedErrorMessages = [
            'Password must be at least 8 characters long',
            'Password must have at least one uppercase letter',
            'Password must have at least one number',
            'Password must have at least one special character',
          ];

          expect(expectedErrorMessages).toContain(passwordErrorMessage);
        });
      });
    });
  });
});
