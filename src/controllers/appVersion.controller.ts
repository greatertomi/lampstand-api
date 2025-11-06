import { Request, Response } from 'express';
import { appVersionConfig } from '../config/appVersion';
import { BadRequestError, HTTP_STATUS } from '../lib/responses';

export const getAppVersion = async (req: Request, res: Response) => {
  const platform = req.query.platform as keyof typeof appVersionConfig;

  if (!platform || !(platform in appVersionConfig)) {
    throw new BadRequestError('Invalid or missing platform parameter. Must be "ios" or "android".');
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: appVersionConfig[platform]
  });
};
