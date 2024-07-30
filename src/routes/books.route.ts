import { Router } from 'express';
import multer from 'multer';
import { saveBook } from '../controllers/books.controller';
import { asyncMiddleware, validate } from '../middleware';
import { bookUploadMiddleware } from '../middleware/book-upload';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/save',
  upload.single('file'),
  bookUploadMiddleware,
  validate,
  asyncMiddleware(saveBook)
);

export default router;
