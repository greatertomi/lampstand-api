import { Router } from 'express';
import { getPreinstalledBooks } from '../controllers';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.get('/', asyncMiddleware(getPreinstalledBooks));

export default router;
