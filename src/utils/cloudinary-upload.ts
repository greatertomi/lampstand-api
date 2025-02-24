import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import cloudinary from '../config/cloudinary';
import { logger } from '../services';

type CloudinaryUploadParams = {
  file: Express.Multer.File;
  folder: string;
  publicId: string;
  fileFormat?: string;
  allowedFormats?: string[];
  resourceType?: 'image' | 'raw';
};

export const uploadToCloudinary = ({
  file,
  folder,
  resourceType = 'raw',
  publicId,
  fileFormat,
  allowedFormats
}: CloudinaryUploadParams): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: resourceType,
        format: fileFormat,
        access_mode: 'public',
        allowed_formats: allowedFormats
      },
      (error, result) => {
        if (result) {
          logger.info(`File uploaded successfully: ${result.public_id}`, {
            location: 'uploadToCloudinary'
          });
          resolve(result);
        } else {
          logger.error(`Cloudinary upload error: ${error?.message}`, {
            location: 'uploadToCloudinary',
            errorMessage: error?.message,
            message: error?.message
          });
          reject(error);
        }
      }
    );

    const readableStream = stream.Readable.from(file.buffer);
    readableStream.pipe(uploadStream);
  });
};
