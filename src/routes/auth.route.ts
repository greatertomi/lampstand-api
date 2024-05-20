import { Router } from 'express';

import { getUsers } from '../controllers/auth.controller';

const router = Router();

router.get('/', getUsers);

export default router;
