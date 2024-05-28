import { HTTP_STATUS } from '../constants';
import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
