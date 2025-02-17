import { NextFunction, Response } from 'express';
import envConfig from '../../config/envConfig';
import { logger } from '../../services';
import { IExtendedRequest } from '../../types';
import { uploadToCloudinary } from '../../utils/cloudinary-upload';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/books`;

const removeSpecialCharacters = (value: string) => {
  return value.split('.')[0].replace(/[^\dA-Za-z]/g, '');
};

export const bookUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const file = req.file;
  const { format } = req.body;

  const bookId = `${removeSpecialCharacters(file.originalname)}-${Date.now()}.${format}`;

  if (!file) {
    logger.warn('No file found in request', {
      location: 'bookUploadMiddleware',
      route: '/api/v1/save'
    });
    return next();
  }

  req.uploadedFile = await uploadToCloudinary({
    file,
    folder: CLOUDINARY_FILE_FOLDER,
    publicId: bookId
  });

  logger.info('Book uploaded successfully', {
    location: 'bookUploadMiddleware',
    route: 'api/v1/save',
    filename: file.originalname
  });

  next();
};

export const multipleBooksUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    logger.warn('No files to upload', {
      location: 'multipleBooksUploadMiddleware',
      route: '/api/v1/saveMany'
    });
    return next();
  }

  req.uploadedFiles = await Promise.all(
    files.map((file) => {
      const fileExtension = file.originalname.split('.').pop();
      const bookId = `${removeSpecialCharacters(file.originalname)}-${Date.now()}.${fileExtension}`;

      logger.info('Book uploaded successfully', {
        location: 'multipleBooksUploadMiddleware',
        route: 'api/v1/saveMany',
        filename: file.originalname,
      });

      return uploadToCloudinary({
        file,
        folder: CLOUDINARY_FILE_FOLDER,
        publicId: bookId
      });
    })
  );

  next();
};
