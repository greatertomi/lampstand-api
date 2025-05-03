import { Request, Response, Router } from 'express';

const homepageRouter = Router();

homepageRouter.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Welcome to Lampstand API' });
});

export default homepageRouter;
