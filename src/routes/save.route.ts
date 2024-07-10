import { Router } from 'express';
import multer from 'multer';
import { uploadBook } from '../controllers/savingBooks.controller';
import { asyncMiddleware } from '../middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), asyncMiddleware(uploadBook));

export default router;
