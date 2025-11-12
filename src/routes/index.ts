import { Router } from 'express';
import appVersion from './appVersion.route';
import auth from './auth.route';
import books from './books.route';
import readingGoals from './goals.route';
import notifications from './notifications.route';
import oauth from './oauth.route';
import preinstalledBooks from './preinstalledBooks.route';
import readingLogs from './readingLog.route';
import reports from './reports.route';
import support from './support.route';
import users from './user.route';
import waitlist from './waitlist.route';

const router = Router();

router.use('/app-version', appVersion);
router.use('/auth', auth);
router.use('/books', books);
router.use('/users', users);
router.use('/goals', readingGoals);
router.use('/readingLogs', readingLogs);
router.use('/oauth', oauth);
router.use('/reports', reports);
router.use('/preinstalledBooks', preinstalledBooks);
router.use('/waitlist', waitlist);
router.use('/support', support);
router.use('/notifications', notifications);

export default router;
