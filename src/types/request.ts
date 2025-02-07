import { Request } from 'express';
import { UploadApiResponse } from 'cloudinary';

export type JwtPayload = {
  id: string;
  fullName: string;
  email: string;
};

export interface IExtendedRequest extends Request {
  uploadedFile?: UploadApiResponse;
  uploadedFiles?: UploadApiResponse[];
  user?: JwtPayload;
}
