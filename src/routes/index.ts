import { Request, Response, Router } from 'express';
import auth from './auth.route';
import save from './save.route';

const router = Router();

router.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

router.use('/auth', auth);
router.use('/save', save);

export default router;
