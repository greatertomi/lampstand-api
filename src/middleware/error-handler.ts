import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CustomError, HTTP_ERRORS } from '../lib/responses';
import { logger } from '../services';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, req: Request, res: Response, _: NextFunction) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).send({ errors: error.serializeErrors() });
  }

  logger.error(error.message);
  res
    .status(HTTP_ERRORS.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: 'Something went wrong' }] });
};

export const asyncMiddleware =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
