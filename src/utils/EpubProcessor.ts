// eslint-disable-next-line max-classes-per-file
import axios from 'axios';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import fs, { unlinkSync } from 'node:fs';
import { logger } from '../services';
import { EpubBookMetadata, EpubManifestItem, ManifestItem, Metadata } from '../types';

class EpubProcessingError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'EpubProcessingError';
  }
}

export class EpubProcessor {
  private parser: XMLParser;

  private readonly filePath: string | null = null;

  private zipFile: JSZip | null = null;

  private localTempFilePath: null | string = './temp-book.epub';

  constructor(filePath: string) {
    this.filePath = filePath;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: false,
      allowBooleanAttributes: true
    });
  }

  private downloadAndReadFileContent = async (): Promise<string> => {
    if (!this.filePath) throw new Error('File path is not set');
    if (!this.localTempFilePath) throw new Error('Local temp file path is not set');

    try {
      logger.debug('Downloading file:', this.filePath);
      const response = await axios.get(this.filePath, {
        responseType: 'arraybuffer',
        timeout: 10_000
      });
      fs.writeFileSync(this.localTempFilePath, response.data);
      return fs.readFileSync(this.localTempFilePath, { encoding: 'base64' });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new EpubProcessingError(`Failed to download file: ${error.message}`, error);
      }
      throw error;
    }
  };

  private cleanMetadataKeys = (obj: Metadata): EpubBookMetadata => {
    const cleanObj: Metadata = {};

    for (const key of Object.keys(obj)) {
      const cleanKey = key.replace(/@_|dc:|#|opf:|xmlns:/g, '');
      const value = obj[key];

      if (Array.isArray(value)) {
        cleanObj[cleanKey] = value.map((item) =>
          typeof item === 'object' ? this.cleanMetadataKeys(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        cleanObj[cleanKey] = this.cleanMetadataKeys(value as Metadata);
      } else {
        cleanObj[cleanKey] = value;
      }
    }

    return cleanObj;
  };

  // eslint-disable-next-line class-methods-use-this
  private cleanManifestKeys = (manifest: EpubManifestItem[]): ManifestItem[] =>
    manifest
      .map((item) => ({
        id: item['@_id'],
        href: item['@_href'],
        mediaType: item['@_media-type']
      }))
      .filter((item) => item.id && item.href);

  private async extractZipContent(filePath: string): Promise<string> {
    if (!this.zipFile) {
      throw new EpubProcessingError('No ZIP file loaded');
    }

    const content = await this.zipFile.file(filePath)?.async('string');
    if (!content) {
      throw new EpubProcessingError('Invalid EPUB file: Missing container.xml');
    }
    return content;
  }

  public process = async () => {
    try {
      const fileContent = await this.downloadAndReadFileContent();

      const arrayBuffer = Buffer.from(fileContent, 'base64');
      this.zipFile = await new JSZip().loadAsync(arrayBuffer);

      const containerContent = await this.extractZipContent('META-INF/container.xml');
      const containerResult = this.parser.parse(containerContent);

      const rootFile = containerResult.container.rootfiles.rootfile['@_full-path'];
      const rootFileContent = await this.zipFile.file(rootFile)?.async('string');

      if (!rootFileContent) {
        logger.error('Invalid EPUB file: Missing root file');
      }

      const rootContent = await this.extractZipContent(rootFile);
      const rootResult = this.parser.parse(rootContent);
      const { metadata: metadataNode, manifest: manifestNode } = rootResult.package;

      return {
        metadata: this.cleanMetadataKeys(metadataNode),
        manifest: this.cleanManifestKeys(manifestNode.item)
      };
    } catch (error) {
      logger.error('Error processing EPUB file:', {
        error: error.message,
        cause: error.cause?.message,
        stack: error.stack
      });

      if (error instanceof EpubProcessingError) {
        throw error;
      }

      throw new EpubProcessingError('Failed to process EPUB file', error as Error);
    }
  };

  public getBookImage = async (manifest: ManifestItem[]): Promise<string | null> => {
    if (!this.zipFile) throw new Error('No ZIP file loaded');

    let coverImageFile: JSZip.JSZipObject | null | undefined;
    const coverImagePath = manifest.find(
      (item) => item.id === 'cover-image' || item.id === 'cover'
    )?.href;
    coverImageFile = this.zipFile?.file(`${coverImagePath}`);

    if (!coverImageFile && this.zipFile) {
      const secondaryCoverImagePath = Object.keys(this.zipFile.files).find((key) =>
        /cover.*\.(jpg|png)/.test(key)
      );
      coverImageFile = this.zipFile.file(`${secondaryCoverImagePath}`);
    }

    if (!coverImageFile) {
      return null;
    }

    const coverImageData = await coverImageFile?.async('base64');
    return `data:image/jpeg;base64,${coverImageData}`;
  };

  public getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  public async cleanup(): Promise<void> {
    if (this.localTempFilePath) {
      try {
        unlinkSync(this.localTempFilePath);
        this.localTempFilePath = null;
      } catch {
        logger.warn(`Failed to delete temporary file: ${this.localTempFilePath}`);
      }
    }
    this.zipFile = null;
  }
}
