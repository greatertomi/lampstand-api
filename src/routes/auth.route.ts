import { Router } from 'express';
import { signup, verifyEmail, login, requestPasswordReset, verifyResetToken, updatePassword } from '../controllers';
import {
  asyncMiddleware,
  forgotPasswordValidationRules,
  updatePasswordValidationRules
} from '../middleware';
import { userValidationRules, loginValidationRules, validate } from '../middleware';


const router = Router();

router.get('/verify-email', asyncMiddleware(verifyEmail));

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));
router.post('/login', loginValidationRules(), validate,  asyncMiddleware(login));
router.post('/reset-password', forgotPasswordValidationRules(), validate, asyncMiddleware(requestPasswordReset));
router.post('/verify-reset-token',  asyncMiddleware(verifyResetToken));
router.put('/update-password',  updatePasswordValidationRules(), validate, updatePassword);

export default router;
