import { Router } from 'express';
import multer from 'multer';
import { saveBook } from '../controllers/savingBooks.controller';
import { asyncMiddleware } from '../middleware';
import { bookUploadMiddleware } from '../middleware/book-upload';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), bookUploadMiddleware, asyncMiddleware(saveBook));

export default router;
