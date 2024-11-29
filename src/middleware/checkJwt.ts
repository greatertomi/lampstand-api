import { NextFunction, Response } from 'express';

import { JwtHelper } from '../lib';
import { UnAuthorizeError } from '../lib/responses';
import { IExtendedRequest, JwtPayload } from '../types';

export const checkJwt = (req: IExtendedRequest, _: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnAuthorizeError('Authorization header not provided');
  try {
    req.user = JwtHelper.verifyToken(token) as JwtPayload;
    return next();
  } catch {
    throw new UnAuthorizeError('Invalid token');
  }
};
