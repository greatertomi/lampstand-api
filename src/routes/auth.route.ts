import { Router } from 'express';
import { signup } from '../controllers/auth.controller';

const router = Router();

router.get('/', signup);

export default router;
