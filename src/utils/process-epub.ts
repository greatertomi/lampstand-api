import JSZip from 'jszip';
import fs from 'node:fs';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../services';
import { EpubBookMetadata, EpubManifestItem, ManifestItem, Metadata } from '../types';


const downloadFile = async (url: string, localPath: string) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(localPath, response.data);
};


export const cleanMetadataKeys = (obj: Metadata): EpubBookMetadata => {
  const cleanObj: Metadata = {};

  for (const key of Object.keys(obj)) {
    const cleanKey = key.replace(/@_|dc:|#|opf:|xmlns:/g, '');
    const value = obj[key];

    if (Array.isArray(value)) {
      cleanObj[cleanKey] = value.map((item) =>
        typeof item === 'object' ? cleanMetadataKeys(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      cleanObj[cleanKey] = cleanMetadataKeys(value as Metadata);
    } else {
      cleanObj[cleanKey] = value;
    }
  }

  return cleanObj;
};

export const cleanManifestKeys = (manifest: EpubManifestItem[]): ManifestItem[] =>
  manifest.map((item) => ({
    id: item['@_id'],
    href: item['@_href'],
    mediaType: item['@_media-type']
  }));

export const processEpubFile = async (bookPath: string) => {
  try {
    const tempFilePath = './temp-book.epub'; // Temporary local file path

    await downloadFile(bookPath, tempFilePath);

    const fileContent = fs.readFileSync(tempFilePath, { encoding: 'base64' });

    const arrayBuffer = Uint8Array.from(atob(fileContent), (c) => c.codePointAt(0)).buffer;
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(arrayBuffer);
    const content = await zipFile.file('META-INF/container.xml')?.async('string');

    if (!content) {
      logger.error('Invalid EPUB file: Missing container.xml');
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: false
    });
    const result = parser.parse(content);
    const rootFile = result.container.rootfiles.rootfile['@_full-path'];
    const rootFileContent = await zipFile.file(rootFile)?.async('string');

    if (!rootFileContent) {
      logger.error('Invalid EPUB file: Missing root file');
    }

    const rootResult = parser.parse(rootFileContent);
    const metadataNode = rootResult.package.metadata;
    const manifestNode = rootResult.package.manifest;



    return {
      metadata: cleanMetadataKeys(metadataNode),
      manifest: cleanManifestKeys(manifestNode.item),
      zipFile
    };
  } catch (error) {
    logger.error('Error processing EPUB file1:', error);
    return null;
  }
};


export const getBookImage = async (
  manifest: ManifestItem[],
  zipFile?: JSZip
): Promise<string | null> => {
  let coverImageFile;
  const coverImagePath = manifest.find(
    (item) => item.id === 'cover-image' || item.id === 'cover'
  )?.href;
  coverImageFile = zipFile?.file(`${coverImagePath}`);

  if (!coverImageFile && zipFile) {
    const secondaryCoverImagePath = Object.keys(zipFile.files).find((key) =>
      /cover.*\.(jpg|png)/.test(key)
    );
    coverImageFile = zipFile.file(`${secondaryCoverImagePath}`);
  }

  if (!coverImageFile) {
    return null;
  }

  const coverImageData = await coverImageFile?.async('base64');
  return `data:image/jpeg;base64,${coverImageData}`;
};

export const getFileExtension = (filename: string): string | undefined => {
  return filename.split('.').pop()?.toLowerCase();
};
