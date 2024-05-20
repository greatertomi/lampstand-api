import { Router } from 'express';

import users from './auth.route';

const router = Router();

router.use('/users', users);

export default router;
