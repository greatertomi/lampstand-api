import { Request, Response, Router } from 'express';
import auth from './auth.route';

const router = Router();

router.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

router.use('/auth', auth);

export default router;
