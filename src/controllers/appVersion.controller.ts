import { Request, Response } from 'express';
import * as fs from 'node:fs';
import path from 'node:path';
import { BadRequestError, HTTP_STATUS } from '../lib/responses';

interface AppVersionData {
  latestVersion: string;
  minSupportedVersion: string;
  storeUrl: string;
}

interface AppVersionConfig {
  ios: AppVersionData;
  android: AppVersionData;
}

export const getAppVersion = async (req: Request, res: Response) => {
  const platform = req.query.platform as string;

  if (!platform || (platform !== 'ios' && platform !== 'android')) {
    throw new BadRequestError('Invalid or missing platform parameter. Must be "ios" or "android".');
  }

  const configPath = path.join(process.cwd(), 'config/appVersion.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const versionConfig: AppVersionConfig = JSON.parse(configData);

  const versionData = versionConfig[platform as keyof AppVersionConfig];

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: versionData
  });
};
