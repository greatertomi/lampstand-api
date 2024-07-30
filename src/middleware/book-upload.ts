import { NextFunction, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import cloudinary from '../config/cloudinary';
import envConfig from '../config/envConfig';
import { BookFormat } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';
import { IExtendedRequest } from '../types';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/books`;

export const bookUploadMiddleware = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const file = req.file;
  const { format } = req.body;

  if (!file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'No file uploaded' });
  }

  if (!Object.values(BookFormat).includes(format)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid book format' });
  }

  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  if (fileExtension !== format) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: 'File extension does not match the specified format' });
  }

  const bookPublicId = `${file.originalname.split('.')[0]}-${Date.now()}`;

  req.uploadedFile = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: bookPublicId,
        folder: CLOUDINARY_FILE_FOLDER,
        resource_type: 'raw',
        format: format,
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
