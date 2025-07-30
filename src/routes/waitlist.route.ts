import express from 'express';
import { checkWaitlistEmail, saveWaitlistEmail, verifyWaitlistEmail } from '../controllers';
import { asyncMiddleware } from '../middleware';

const router = express.Router();

router.post('/save-email', asyncMiddleware(saveWaitlistEmail));
router.get('/check-email', asyncMiddleware(checkWaitlistEmail));
router.post('/verify-email', asyncMiddleware(verifyWaitlistEmail));

export default router;
