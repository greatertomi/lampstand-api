import { NextFunction, Response } from 'express';
import envConfig from '../../config/envConfig';
import { logger } from '../../services';
import { IExtendedRequest } from '../../types';
import { uploadToCloudinary } from '../../utils/cloudinary-upload';

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

  req.uploadedFile = await uploadToCloudinary(file, CLOUDINARY_FILE_FOLDER, format);

  next();
};

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
    files.map((file) => uploadToCloudinary(file, CLOUDINARY_FILE_FOLDER))
  );

  next();
};
