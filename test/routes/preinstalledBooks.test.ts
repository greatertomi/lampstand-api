import { PreInstalledBook } from '../../src/controllers';
import { HTTP_STATUS } from '../../src/lib/responses';
import { TestFactory } from '../factory';

describe('Testing the preinstalled book route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
  });

  describe('GET /preinstalled-books', () => {
    it('should return pre installed books', async () => {
      const response = await factory.app.get('/preinstalledBooks');
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.map((book: PreInstalledBook) => {
        expect(book).toEqual(
          expect.objectContaining({
            secure_url: expect.any(String),
            url: expect.any(String),
            format: expect.any(String),
            size: expect.any(Number),
            uploadedAt: expect.any(String)
          })
        );
      });
    });
  });
});
