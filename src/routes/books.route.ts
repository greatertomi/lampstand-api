import { Router } from 'express';
import multer from 'multer';
import { getUserBooks, saveBook } from '../controllers/books.controller';
import { asyncMiddleware, checkJwt, saveBookValidationRules, validate } from '../middleware';
import { bookUploadMiddleware } from '../middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/save',
  upload.single('file'),
  bookUploadMiddleware,
  saveBookValidationRules,
  validate,
  asyncMiddleware(saveBook)
);

router.get('/get', checkJwt, asyncMiddleware(getUserBooks));

export default router;
