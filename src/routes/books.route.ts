import { Router } from 'express';
import multer from 'multer';
import { saveBook } from '../controllers/books.controller';
import {
  asyncMiddleware,
  bookUploadMiddleware,
  checkJwt,
  saveBookValidationRules,
  validate
} from '../middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/save',
  checkJwt,
  upload.single('file'),
  saveBookValidationRules,
  validate,
  bookUploadMiddleware,
  asyncMiddleware(saveBook)
);

export default router;
