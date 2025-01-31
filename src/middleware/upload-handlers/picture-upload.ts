import { NextFunction, Response } from 'express';
import envConfig from '../../config/envConfig';
import { IExtendedRequest } from '../../types';
import { uploadToCloudinary } from '../../utils/cloudinary-upload';

const CLOUDINARY_FILE_FOLDER = `lampstand/${envConfig.NODE_ENV}/profile-pictures`;

export const profilePictureUploadMiddleware = async (
  req: IExtendedRequest,
  _: Response,
  next: NextFunction
) => {
  const file = req.file;

  if (!file) {
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

  next();
};
