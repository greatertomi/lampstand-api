/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import JSZip from 'jszip';
import * as fs from 'node:fs';
import { EpubProcessor } from '../../src/utils';

jest.mock('axios');
jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));
jest.mock('jszip');

const bookPath = 'https://res.cloudinary.com/example/raw/upload/v1234567890/test-book.epub';
const localTempFilePath = './temp-book.epub';
describe('EpubProcessor', () => {
  let epubProcessor: EpubProcessor;

  beforeEach(() => {
    epubProcessor = new EpubProcessor(bookPath);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadAndReadFileContent', () => {
    it('should download and read the file', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: Buffer.from('dummy file content')
      });

      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue('dummy file content in base64');

      const result = await epubProcessor['downloadAndReadFileContent']();

      expect(axios.get).toHaveBeenCalledWith(bookPath, {
        responseType: 'arraybuffer',
        timeout: 10_000
      });

      expect(fs.writeFileSync).toHaveBeenCalledWith(localTempFilePath, expect.any(Buffer));
      expect(fs.readFileSync).toHaveBeenCalledWith(localTempFilePath, { encoding: 'base64' });
      expect(result).toBe('dummy file content in base64');
    });

    it('should delete the temporary file and reset the zip file', async () => {
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await epubProcessor.cleanup();

      expect(fs.unlinkSync).toHaveBeenCalledWith(localTempFilePath);
      expect(epubProcessor['zipFile']).toBeNull();
      expect(epubProcessor['localTempFilePath']).toBeNull();
    });
  });

  describe('getBookImage', () => {
    it('should return the cover image as a base64 string', async () => {
      const mockZip = {
        file: jest.fn().mockImplementation((path) => {
          if (path === 'cover.jpg') {
            return { async: () => 'mockImageData' };
          }
          return null;
        })
      };

      epubProcessor['zipFile'] = mockZip as unknown as JSZip;

      const manifest = [{ id: 'cover-image', href: 'cover.jpg', mediaType: 'image/jpeg' }];

      const result = await epubProcessor.getBookImage(manifest);

      expect(result).toBe('data:image/jpeg;base64,mockImageData');
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
