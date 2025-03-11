import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CustomError, HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-params
export const errorHandler = (error: Error, req: Request, res: Response, _: NextFunction) => {
  if (error instanceof CustomError) {
    logger.error({
      message: `CustomError encountered: ${error.message}`,
      location: 'errorHandler',
      route: req.originalUrl,
      method: req.method,
      statusCode: error.statusCode,
      errors: error.serializeErrors()
    });

    return res.status(error.statusCode).send({ errors: error.serializeErrors() });
  }

  logger.error({
    location: 'errorHandler',
    route: req.originalUrl,
    method: req.method,
    errorMessage: error.message,
    message: `Unhandled error occurred: ${error.message}`,
    stack: error.stack
  });

  res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: `An unexpected error occurred: ${error.message}`, route: req.originalUrl,
        stack: error.stack.split('/n') }] });
};

export const asyncMiddleware =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
