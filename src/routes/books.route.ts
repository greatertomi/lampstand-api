import { Router } from 'express';
import multer from 'multer';
import { getUserBooks, saveBook, deleteBook } from '../controllers/books.controller';
import {
  asyncMiddleware,
  bookUploadMiddleware,
  checkJwt,
  saveBookValidationRules,
  validate
} from '../middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', checkJwt, asyncMiddleware(getUserBooks));

router.post(
  '/save',
  checkJwt,
  upload.single('file'),
  saveBookValidationRules,
  validate,
  bookUploadMiddleware,
  asyncMiddleware(saveBook)
);

router.delete('/delete/:id', checkJwt, asyncMiddleware(deleteBook));

export default router;
