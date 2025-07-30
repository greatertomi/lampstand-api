import { Router } from 'express';
import {
  login,
  requestPasswordReset,
  resendVerificationEmail,
  signup,
  updatePassword,
  verifyEmail,
  verifyResetToken
} from '../controllers';
import {
  asyncMiddleware,
  forgotPasswordValidationRules,
  loginValidationRules,
  resendVerificationEmailValidationRules,
  updatePasswordValidationRules,
  userValidationRules,
  validate,
  verifyResetTokenValidationRules
} from '../middleware';

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

router.post(
  '/resend-verification-email',
  resendVerificationEmailValidationRules(),
  validate,
  asyncMiddleware(resendVerificationEmail)
);

export default router;
