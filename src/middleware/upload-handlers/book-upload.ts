import stream from 'node:stream';

import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Response } from 'express';

import cloudinary from '../../config/cloudinary';
import envConfig from '../../config/envConfig';
import { logger } from '../../services';
import { IExtendedRequest } from '../../types';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/books`;

export const bookUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const file = req.file;
  const { format } = req.body;

  if (!file) {
    return next();
  }

  const bookPublicId = `${file.originalname.split('.')[0].replace(/\s+/g, '')}-${Date.now()}`;

  req.uploadedFile = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: bookPublicId,
        folder: CLOUDINARY_FILE_FOLDER,
        resource_type: 'raw',
        format,
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

  next();
};
