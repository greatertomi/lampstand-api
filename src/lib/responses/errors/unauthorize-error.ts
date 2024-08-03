import { HTTP_STATUS } from '../constants';
import { CustomError } from './custom-error';

export class UnAuthorizeError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, UnAuthorizeError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
