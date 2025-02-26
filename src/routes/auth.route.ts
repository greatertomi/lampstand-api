import { Router } from 'express';
import {
  login,
  requestPasswordReset,
  resendPasswordRequest,
  signup,
  updatePassword,
  verifyEmail,
  verifyResetToken
} from '../controllers';
import {
  asyncMiddleware,
  forgotPasswordValidationRules,
  loginValidationRules,
  updatePasswordValidationRules,
  userValidationRules,
  validate,
  verifyResetTokenValidationRules,
  resendPasswordTokenValidationRules
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

router.post('/resend-token', resendPasswordTokenValidationRules(), validate, asyncMiddleware(resendPasswordRequest));
export default router;
