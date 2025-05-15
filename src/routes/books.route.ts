import { Router } from 'express';
import multer from 'multer';
import {
  deleteAllBooks,
  deleteBook,
  getUserBooks,
  saveBook,
  saveManyBooks,
  updateBook
} from '../controllers';
import {
  asyncMiddleware,
  bookUploadMiddleware,
  checkJwt,
  multipleBooksUploadMiddleware,
  saveBookValidationRules,
  saveMultipleBooksValidationRules,
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
router.delete('/deleteAll', checkJwt, asyncMiddleware(deleteAllBooks));

router.post(
  '/saveMultiple',
  checkJwt,
  upload.array('files'),
  saveMultipleBooksValidationRules,
  validate,
  multipleBooksUploadMiddleware,
  asyncMiddleware(saveManyBooks)
);

export default router;
