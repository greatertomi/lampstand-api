import { Router } from 'express';
import { signup } from '../controllers';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.get('/signup', asyncMiddleware(signup));

export default router;
