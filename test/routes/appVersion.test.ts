import { HTTP_STATUS } from '../../src/lib/responses';
import { TestFactory } from '../factory';

describe('Testing the app-version route', () => {
  const factory: TestFactory = new TestFactory();
  const appVersionRoute = '/app-version';
  const invalidPlatformMessage = 'Invalid or missing platform parameter. Must be "ios" or "android".';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  describe('GET /app-version', () => {
    it('should return iOS version data when platform is ios', async () => {
      const res = await factory.app
        .get(appVersionRoute)
        .query({ platform: 'ios' })
        .expect(HTTP_STATUS.OK);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('latestVersion');
      expect(res.body.data).toHaveProperty('minSupportedVersion');
      expect(res.body.data).toHaveProperty('storeUrl');
      expect(res.body.data.storeUrl).toContain('apps.apple.com');
    });

    it('should return Android version data when platform is android', async () => {
      const res = await factory.app
        .get(appVersionRoute)
        .query({ platform: 'android' })
        .expect(HTTP_STATUS.OK);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('latestVersion');
      expect(res.body.data).toHaveProperty('minSupportedVersion');
      expect(res.body.data).toHaveProperty('storeUrl');
      expect(res.body.data.storeUrl).toContain('play.google.com');
    });

    it('should return 400 error when platform parameter is missing', async () => {
      const res = await factory.app.get(appVersionRoute).expect(HTTP_STATUS.BAD_REQUEST);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('message', invalidPlatformMessage);
    });

    it('should return 400 error when platform parameter is invalid', async () => {
      const res = await factory.app
        .get(appVersionRoute)
        .query({ platform: 'windows' })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('message', invalidPlatformMessage);
    });

    it('should return 400 error when platform parameter is empty string', async () => {
      const res = await factory.app
        .get(appVersionRoute)
        .query({ platform: '' })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('message', invalidPlatformMessage);
    });
  });
});
