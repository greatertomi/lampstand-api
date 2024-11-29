import { NextFunction, Request, RequestHandler, Response } from 'express';

import { CustomError, HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';

type ErrorHandlerType = {
  error: Error;
  res: Response;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = ({ error, res }: ErrorHandlerType) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).send({ errors: error.serializeErrors() });
  }

  logger.error(error.message);
  res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: 'Something went wrong' }] });
};

export const asyncMiddleware =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
