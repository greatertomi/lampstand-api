import { NextFunction, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import cloudinary from '../../config/cloudinary';
import envConfig from '../../config/envConfig';
import { logger } from '../../services';
import { IExtendedRequest } from '../../types';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/books`;

export const multipleBooksUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    logger.warn('No files to upload.');
    return next();
  }

  req.uploadedFiles = await Promise.all(
    files.map((file) => {
      const fileExtension = file.originalname.split('.').pop();
      const bookPublicId = `${file.originalname.split('.')[0].replace(/\s+/g, '')}-${Date.now()}.${fileExtension}`;

      return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: bookPublicId,
            folder: CLOUDINARY_FILE_FOLDER,
            resource_type: 'raw',
            access_mode: 'public'
          },
          (error, result) => {
            if (result) {
              logger.info(`File uploaded successfully: ${result.public_id}`);
              resolve(result);
            } else {
              logger.error(`Cloudinary upload error: ${error.message}`);
              reject(error);
            }
          }
        );
        const readableStream = stream.Readable.from(file.buffer);
        readableStream.pipe(uploadStream);
      });
    })
  );
  next();
};
