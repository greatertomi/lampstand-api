import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import cloudinary from '../config/cloudinary';
import { logger } from '../services';
import { BadRequestError } from '../lib/responses';

export const uploadToCloudinary = (file: Express.Multer.File,
                                   folder: string,
                                   format?: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const fileNameWithoutSpaces = file.originalname.split('.')[0].replace(/\s+/g, '');
    const fileExtension = file.originalname.split('.').pop();
    const fileFormat = format || fileExtension;
    if (format && format !== fileExtension) {
      throw new BadRequestError('Format does not match the file extension');
    }
    const publicId = `${fileNameWithoutSpaces}-${Date.now()}.${fileFormat}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: 'raw',
        format,
        access_mode: 'public',
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
