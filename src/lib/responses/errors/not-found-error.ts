import { HTTP_ERRORS } from '../constants';
import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = HTTP_ERRORS.NOT_FOUND;

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
