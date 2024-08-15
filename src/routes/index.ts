import { Request, Response, Router } from 'express';
import auth from './auth.route';
import books from './books.route';

const router = Router();

router.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

router.use('/auth', auth);
router.use('/books', books);

export default router;
