import { JwtPayload } from './jwt-payload';

export {};

declare global {
  namespace Express {
    export interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}
