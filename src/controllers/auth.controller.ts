import { Request, Response } from 'express';

export const signup = async (req: Request, res: Response) => {
  return res.send({
    message: 'Hello, World! - Lampstand'
  });
};
