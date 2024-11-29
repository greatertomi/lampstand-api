import { UploadApiResponse } from 'cloudinary';
import { Request } from 'express';

export type JwtPayload = {
  id: string;
  fullName: string;
  email: string;
};

export interface IExtendedRequest extends Request {
  uploadedFile?: UploadApiResponse;
  user?: JwtPayload;
}
