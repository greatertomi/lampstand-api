import { NextFunction, Response } from 'express';
import envConfig from '../../config/envConfig';
import { IExtendedRequest } from '../../types';
import { uploadToCloudinary } from '../../utils/cloudinary-upload';
import { logger } from '../../services';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/profile-pictures`;

export const profilePictureUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const file = req.file;

  if (!file) {
    logger.warn('No file found in request', {
      location: 'profilePictureUploadMiddleware',
      route: '/api/v1/profile-picture'
    });
    return next();
  }

  const fileExtension = file.originalname.split('.').pop();
  const profilePicPublicId = `profile-${req.user.id}-${Date.now()}`;

  req.uploadedFile = await uploadToCloudinary({
    file,
    fileFormat: fileExtension,
    folder: CLOUDINARY_FILE_FOLDER,
    publicId: profilePicPublicId,
    allowedFormats: ['jpg', 'png', 'jpeg'],
    resourceType: 'image'
  });

  logger.info('Profile Picture uploaded successfully', {
    location: 'profilePictureUploadMiddleware',
    route: 'api/v1/profile-picture',
    filename: file.originalname
  });

  next();
};
