import cron from 'node-cron';
import { PushNotificationService } from '../services';

const pushService = new PushNotificationService();

// Run every day at 9:00 AM server time
cron.schedule('0 9 * * *', async () => {
  await pushService.sendToAllUsers({
    title: 'Good Morning 🌞',
    body: 'Start your day with Lampstand 📖',
    data: { screen: 'Home' }
  });
});
