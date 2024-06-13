import { Router } from 'express';
import { signup, verifyEmail } from '../controllers';
import { asyncMiddleware } from '../middleware';
import { userValidationRules, validate } from '../middleware';


const router = Router();

router.get('/verify-email', asyncMiddleware(verifyEmail));

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));

export default router;
