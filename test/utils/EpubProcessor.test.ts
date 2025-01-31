/* eslint-disable @typescript-eslint/dot-notation */
import JSZip from 'jszip';
import * as fs from 'node:fs';
import path from 'node:path';
import { EpubProcessor } from '../../src/utils';

// eslint-disable-next-line unicorn/prefer-module
const testFilePath = path.join(__dirname, 'test-book.epub');

describe('EpubProcessor', () => {
  let epubProcessor: EpubProcessor;

  beforeEach(() => {
    epubProcessor = new EpubProcessor(testFilePath);
    epubProcessor['localTempFilePath'] = testFilePath;

    epubProcessor['downloadAndReadFileContent'] = async () => {
      return fs.readFileSync(testFilePath, { encoding: 'base64' });
    };
  });

  describe('process', () => {
    it('should successfully process the test EPUB file', async () => {
      const result = await epubProcessor.process();

      expect(result.metadata).toBeDefined();
      expect(result.manifest).toBeDefined();

      for (const item of result.manifest) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('mediaType');
      }

      expect(result.metadata).toHaveProperty('title');
      expect(result.metadata).toHaveProperty('language');
    });

    it('should throw an error if the file is not found', async () => {
      const currentBookProcessor = new EpubProcessor('invalid-file-path');

      await expect(currentBookProcessor.process()).rejects.toThrow();
    });
  });

  describe('getBookImage', () => {
    it('should return the cover image as a base64 string', async () => {
      const result = await epubProcessor.process();
      const coverImage = await epubProcessor.getBookImage(result.manifest);
      if (coverImage) {
        expect(coverImage).toMatch(/^data:image\/.*;base64,/);
      }
    });

    it('should return null if no cover image is found', async () => {
      const mockZip = {
        file: jest.fn().mockReturnValue(null),
        files: {}
      };

      epubProcessor['zipFile'] = mockZip as unknown as JSZip;

      const manifest = [{ id: 'id1', href: 'href1', mediaType: 'type1' }];

      const result = await epubProcessor.getBookImage(manifest);

      expect(result).toBeNull();
    });
  });
});
