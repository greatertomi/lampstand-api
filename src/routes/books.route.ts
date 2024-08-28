import { Router } from 'express';
import multer from 'multer';
import { deleteBook, getUserBooks, saveBook, updateBook } from '../controllers/books.controller';
import {
  asyncMiddleware,
  bookUploadMiddleware,
  checkJwt,
  saveBookValidationRules,
  updateBookValidationRules,
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

router.put(
  '/update/:id',
  checkJwt,
  upload.single('file'),
  updateBookValidationRules,
  validate,
  bookUploadMiddleware,
  asyncMiddleware(updateBook)
);

router.delete('/delete/:id', checkJwt, asyncMiddleware(deleteBook));

export default router;
