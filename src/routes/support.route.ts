import express from 'express';
import multer from 'multer';
import { complaintMessage, feedbackMessage } from '../controllers';
import { asyncMiddleware, supportValidationRules, validate } from '../middleware';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/complaint', supportValidationRules, validate, asyncMiddleware(complaintMessage));
router.post(
  '/feedback',
  upload.array('images'),
  supportValidationRules,
  validate,
  asyncMiddleware(feedbackMessage)
);

export default router;
