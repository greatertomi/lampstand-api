import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import cloudinary from '../config/cloudinary';
import { BadRequestError } from '../lib/responses';
import { logger } from '../services';

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string,
  format?: string,
  picId?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const fileNameWithoutSpaces = file.originalname.split('.')[0].replace(/\s+/g, '');
    const fileExtension = file.originalname.split('.').pop();
    const fileFormat = format || fileExtension;
    const isImage = file.mimetype.startsWith('image/');

    if (!isImage && format && format !== fileExtension) {
      throw new BadRequestError('Format does not match the file extension');
    }

    const bookId = `${fileNameWithoutSpaces}-${Date.now()}.${fileFormat}`;
    const publicId = isImage ? picId : bookId;
    const resourceType = isImage ? 'image' : 'raw';

    const allowedFormats = isImage ? ['jpg', 'png', 'jpeg'] : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: resourceType,
        format,
        access_mode: 'public',
        allowed_formats: allowedFormats
      },
      (error, result) => {
        if (result) {
          logger.info(`File uploaded successfully: ${result.public_id}`);
          resolve(result);
        } else {
          logger.error(`Cloudinary upload error: ${error?.message}`);
          reject(error);
        }
      }
    );

    const readableStream = stream.Readable.from(file.buffer);
    readableStream.pipe(uploadStream);
  });
};
