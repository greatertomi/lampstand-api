import { HTTP_ERRORS } from '../constants';
import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = HTTP_ERRORS.BAD_REQUEST;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
