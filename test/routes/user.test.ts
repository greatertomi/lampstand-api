/* eslint-disable sonarjs/no-duplicate-string */
import { UserEntity } from '../../src/entities';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

const uploadLink = 'https://res.cloudinary.com/example/image/upload/v1234567890/test-profile.jpg';
jest.mock('../../src/middleware/upload-handlers/picture-upload', () => ({
  profilePictureUploadMiddleware: jest.fn((req, res, next) => {
    req.uploadedFile = {
      secure_url: uploadLink
    };
    next();
  })
}));

const unAuthenticatedMessage = 'Authorization header not provided';

describe('[GET] users/me', () => {
  const factory: TestFactory = new TestFactory();
  const meRoute = '/users/me';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });

  it('should return the logged-in user information', async () => {
    const { user } = await createTestUser(factory);
    const token = await getTestAuthToken(user);

    const res = await factory.app
      .get(meRoute)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
      email: expect.any(String),
      phoneNumber: null,
      agreedToTerms: expect.any(Boolean),
      isEmailVerified: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });

    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 404 with error message when fetching a non-existent user', async () => {
    const nonExistentUser: JwtPayload = {
      id: '4f4ef67c-75fa-4490-bf02-b2429ccb4084',
      email: 'nonexistent@example.com',
      fullName: 'Non Existent User'
    };
    const token = await getTestAuthToken(nonExistentUser);

    const res = await factory.app
      .get(meRoute)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.NOT_FOUND);
    expect(res.body).toEqual({
      errors: [
        {
          message: 'User not found'
        }
      ]
    });
  });

  it('should return 401 if the user is not authenticated', async () => {
    const res = await factory.app.get(meRoute).expect(HTTP_STATUS.UNAUTHORIZED);

    expect(res.body).toEqual({
      errors: [
        {
          message: 'Authorization header not provided'
        }
      ]
    });
  });

  describe('PUT /users/profile-picture.', () => {
    const updateProfilePictureRoute = '/users/profile-picture';

    it('should upload and update profile picture successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .put(updateProfilePictureRoute)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePicture', Buffer.from('dummy image content'), 'test-profile.jpg');

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty('message', 'Profile picture uploaded successfully');
      expect(response.body.data).toHaveProperty('profilePictureUrl');

      const updatedUser = await factory._connection
        .getRepository(UserEntity)
        .findOne({ where: { id: user.id } });
      expect(updatedUser?.profilePicture).toBe(response.body.data.profilePictureUrl);
    });

    it('should return 404 if user is not found', async () => {
      const token = await getTestAuthToken({
        id: '4f4ef67c-75fa-4490-bf02-b2429ccb4084',
        fullName: 'Non Existent User',
        email: 'nonexistent@example.com'
      });
      const response = await factory.app
        .put(updateProfilePictureRoute)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePicture', Buffer.from('dummy image content'), 'test-profile.jpg');

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toEqual({
        errors: [{ message: 'User not found' }]
      });
    });

    it('should return 422 if the profile picture file is not provided', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const response = await factory.app
        .put(updateProfilePictureRoute)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            field: 'profilePicture',
            message: 'Invalid file upload'
          }
        ])
      );
    });

    it('should throw an error if auth token is not provided', async () => {
      const response = await factory.app
        .put(updateProfilePictureRoute)
        .attach('profilePicture', Buffer.from('dummy image content'), 'test-profile.jpg');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.errors).toMatchObject([
        {
          message: unAuthenticatedMessage
        }
      ]);
    });
  });

  describe('[DELETE] users/remove-account', () => {
    const removeAccountRoute = '/users/remove-account';
    it('should remove the user account and associated data successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const res = await factory.app
        .delete(removeAccountRoute)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.OK);

      expect(res.body).toEqual({
        message: 'User and associated data successfully deleted'
      });
      const deletedUser = await factory._connection
        .getRepository(UserEntity)
        .findOne({ where: { id: user.id } });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 when trying to remove a non-existent user', async () => {
      const nonExistentUser = {
        id: '4f4ef67c-75fa-4490-bf02-b2429ccb4084',
        email: 'nonexistent@example.com',
        fullName: 'Non Existent User'
      };
      const token = await getTestAuthToken(nonExistentUser);

      const res = await factory.app
        .delete(removeAccountRoute)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(res.body).toEqual({
        errors: [
          {
            message: 'User not found'
          }
        ]
      });
    });

    it('should return 401 if the user is not authenticated', async () => {
      const res = await factory.app.delete(removeAccountRoute).expect(HTTP_STATUS.UNAUTHORIZED);

      expect(res.body).toEqual({
        errors: [
          {
            message: 'Authorization header not provided'
          }
        ]
      });
    });
  });

  describe('[PUT] users/update/me', () => {
    const updateMeRoute = '/users/update/me';

    it('Should update successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const fullName = 'Updated User';
      const phoneNumber = '08123456789';

      const response = await factory.app
        .put(updateMeRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName, phoneNumber })
        .expect(HTTP_STATUS.OK);

      expect(response.body.message).toEqual('User profile updated successfully');
    });

    it('Should throw a not found error', async () => {
      const notExistingUser = {
        id: 'e87b5fc7-9c77-4c2d-a1d5-3e012a115881',
        email: 'testUser@gmail.com',
        fullName: 'test user'
      };
      const token = await getTestAuthToken(notExistingUser);
      const fullName = 'Updated User';
      const phoneNumber = '08123456789';

      const response = await factory.app
        .put(updateMeRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName, phoneNumber });
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toEqual({
        errors: [
          {
            message: 'User not found'
          }
        ]
      });
    });

    it('Should validate request body properly', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const emptyFieldErrorMessages = [
        { field: 'fullName', message: 'Full name can only contain letters and spaces' },
        { field: 'phoneNumber', message: 'Phone number must be a minimum of 8 digits' }
      ];

      const invalidFieldsError = [
        { field: 'fullName', message: 'Full name must be more than 3 characters' },
        { field: 'phoneNumber', message: 'Phone number must be a minimum of 8 digits' }
      ];

      const emptyFieldResponse = await factory.app
        .put(updateMeRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: '',
          phoneNumber: ''
        })
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      const invalidNameResponse = await factory.app
        .put(updateMeRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'me'
        })
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      const invalidFieldsResponse = await factory.app
        .put(updateMeRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'me',
          phoneNumber: 'we'
        })
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(emptyFieldResponse.body.errors).toEqual(expect.arrayContaining(emptyFieldErrorMessages));
      expect(Object.keys(emptyFieldResponse.body.errors)).toHaveLength(4);
      expect(invalidNameResponse.body.errors).toEqual(expect.arrayContaining([
        { field: 'fullName', message: 'Full name must be more than 3 characters' }
      ]));
      expect(invalidFieldsResponse.body.errors).toEqual(expect.arrayContaining(invalidFieldsError));
      expect(Object.keys(invalidFieldsResponse.body.errors)).toHaveLength(3);
    });
  });
});
