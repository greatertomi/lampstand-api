import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';

describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  describe('POST /Signup', () => {
    it.todo('should successfully signup a user');

    it.todo('should return an error if the user already exists');

    describe('should return an error if submitted data has missing values', () => {
      it('should return an error if only full name is provided', async () => {
        const res = await factory.app.post('/auth/signup').send({
          fullName: 'John Doe'
        });

        expect(res.status).toEqual(HTTP_STATUS.UNPROCESSABLE_ENTITY);
        expect(Object.keys(res.body.errors).length).toBe(3);
        // expect(res.body.errors.email).toBe('Email address already in use');
        expect(res.body.errors.password).toBe('Password must have at least one special character');
        expect(res.body.errors.agreedToTerms).toBe('Agreed to terms should be a boolean');
      });

      it.todo('should return an error if email and agreedToTerms is invalid');
      /*const data = {
        fullName: 'John Doe',
        email: 'john',
        agreedToTerms: 'yes'
      };*/

      it.todo('should return an error if the password is weak');
      /*const data = {
        fullName: 'John Doe',
        email: 'test@test.com',
        password: 'password',
        agreedToTerms: true
      };*/
    });
  });
});
