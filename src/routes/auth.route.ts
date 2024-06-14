import { Router } from 'express';
import { signup, verifyEmail, login } from '../controllers';
import { asyncMiddleware } from '../middleware';
import { userValidationRules, loginValidationRules, validate } from '../middleware';


const router = Router();

router.get('/verify-email', asyncMiddleware(verifyEmail));

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));
router.post('/login', loginValidationRules(), validate,  asyncMiddleware(login));


export default router;
