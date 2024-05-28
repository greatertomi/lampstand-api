import { Router } from 'express';
import { signup } from '../controllers';
import { asyncMiddleware } from '../middleware';
import { userValidationRules } from '../middleware/userValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));

export default router;
