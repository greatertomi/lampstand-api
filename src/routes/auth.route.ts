import { Router } from 'express';
import { signup } from '../controllers';
import { asyncMiddleware } from '../middleware';
import { userValidationRules, validate } from '../middleware';

const router = Router();

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));

export default router;
