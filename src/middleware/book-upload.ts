import { NextFunction, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import stream from 'node:stream';
import { BookFormat } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';
import { IExtendedRequest } from '../types/uploadfileextends';

const CLOUDINARY_FILE_FOLDER = `books/${process.env.NODE_ENV}/books/files`;

export const bookUploadMiddleware = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info(`Configuring Cloudinary with cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  if (
    !cloudinary.config().cloud_name ||
    !cloudinary.config().api_key ||
    !cloudinary.config().api_secret
  ) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server configuration error' });
  }

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
          resolve(result as UploadApiResponse);
        } else {
          reject(error);
        }
      }
    );

    const readableStream = stream.Readable.from(file.buffer);
    readableStream.pipe(uploadStream);
  });
  next();
};
