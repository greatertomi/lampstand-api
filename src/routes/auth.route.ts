import { Router } from 'express';
import {
  login,
  requestPasswordReset,
  signup,
  updatePassword,
  verifyEmail,
  verifyResetToken
} from '../controllers';
import {
  asyncMiddleware,
  forgotPasswordValidationRules,
  updatePasswordValidationRules,
  verifyResetTokenValidationRules
} from '../middleware';
import { loginValidationRules, userValidationRules, validate } from '../middleware';

const router = Router();

router.get('/verify-email', asyncMiddleware(verifyEmail));

router.post('/signup', userValidationRules(), validate, asyncMiddleware(signup));
router.post('/login', loginValidationRules(), validate, asyncMiddleware(login));
router.post(
  '/reset-password',
  forgotPasswordValidationRules(),
  validate,
  asyncMiddleware(requestPasswordReset)
);
router.post(
  '/verify-reset-token',
  verifyResetTokenValidationRules(),
  validate,
  asyncMiddleware(verifyResetToken)
);
router.put(
  '/update-password',
  updatePasswordValidationRules(),
  validate,
  asyncMiddleware(updatePassword)
);

export default router;
