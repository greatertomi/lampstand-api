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
    const validPlatformTestCases = [
      { platform: 'ios', storeUrlPart: 'apps.apple.com' },
      { platform: 'android', storeUrlPart: 'play.google.com' }
    ];

    const invalidPlatformTestCases = [
      { platform: undefined, description: 'platform parameter is missing' },
      { platform: 'windows', description: 'platform parameter is invalid' },
      { platform: '', description: 'platform parameter is empty string' }
    ];

    it.each(validPlatformTestCases)(
      'should return version data for platform: $platform',
      async ({ platform, storeUrlPart }) => {
        const res = await factory.app
          .get(appVersionRoute)
          .query({ platform })
          .expect(HTTP_STATUS.OK);

        expect(res.body).toMatchObject({
            latestVersion: expect.any(String),
            minSupportedVersion: expect.any(String),
            storeUrl: expect.stringContaining(storeUrlPart)
        });
      }
    );

    it.each(invalidPlatformTestCases)(
      'should return 400 error when $description',
      async ({ platform }) => {
        const request = factory.app.get(appVersionRoute);

        // Only add query parameter if platform is defined (not undefined)
        if (platform !== undefined) {
          request.query({ platform });
        }

        const res = await request.expect(HTTP_STATUS.BAD_REQUEST);

        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('message', invalidPlatformMessage);
      }
    );
  });
});
