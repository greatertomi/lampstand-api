import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../../lib/responses';

type FieldValidationError = ValidationError & {
  path: string;
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = Object.fromEntries(
    errors.array().map((curr: FieldValidationError) => [curr.path, curr.msg])
  );

  return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    errors: extractedErrors
  });
};
