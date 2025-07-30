import express from 'express';
import { asyncMiddleware } from '../middleware';
import { checkWaitlistEmail, saveWaitlistEmail, verifyWaitlistEmail } from '../controllers';

const router = express.Router();

router.post('/save-email', asyncMiddleware(saveWaitlistEmail));
router.get('/check-email', asyncMiddleware(checkWaitlistEmail));
router.post('/verify-email', asyncMiddleware(verifyWaitlistEmail));

export default router;
