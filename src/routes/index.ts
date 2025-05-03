import { Router } from 'express';
import auth from './auth.route';
import books from './books.route';
import readingGoals from './goals.route';
import oauth from './oauth.route';
import readingLogs from './readingLog.route';
import reports from './reports.route';
import users from './user.route';

const router = Router();

router.use('/auth', auth);
router.use('/books', books);
router.use('/users', users);
router.use('/goals', readingGoals);
router.use('/readingLogs', readingLogs);
router.use('/oauth', oauth);
router.use('/reports', reports);

export default router;
