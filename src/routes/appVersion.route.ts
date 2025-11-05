import { Router } from 'express';
import { getAppVersion } from '../controllers';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.get('/', asyncMiddleware(getAppVersion));

export default router;
