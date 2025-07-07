import schedule from 'node-schedule';
import { ReadingGoal } from '../entities';
import { sendPushNotification } from '../utils';
import handleGetRepository from '../utils/handleGetRepository';
import { logger } from './logger';

const userScheduledJobs = new Map<string, schedule.Job>();

const cancelExistingJob = (userId: string) => {
  const existingJob = userScheduledJobs.get(userId);
  if (existingJob) {
    existingJob.cancel();
    userScheduledJobs.delete(userId);
  }
};

export const scheduleReminderForUser = async (userId: string) => {
  const readingGoalRepo = handleGetRepository(ReadingGoal);
  const goal = await readingGoalRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user']
  });

  if (!goal?.reminderTime || !goal.user?.expoPushToken) {
    return;
  }

  cancelExistingJob(userId);

  const [hours, minutes] = goal.reminderTime.split(':').map(Number);
  const rule = new schedule.RecurrenceRule();
  rule.hour = hours;
  rule.minute = minutes;
  rule.tz = goal.timezone;

  const newJob = schedule.scheduleJob(rule, async () => {
    try {
      await sendPushNotification({
        expoPushToken: goal.user.expoPushToken,
        title: 'Reading Reminder 📚',
        body: "Don't forget about your daily goal!!"
      });
      logger.info(`Sent reading reminder to user ${goal.user.id}`);
    } catch (error) {
      logger.error(`Failed to send to user ${goal.user.id}:`, error);
    }
  });

  if (newJob) {
    userScheduledJobs.set(userId, newJob);
  } else {
    logger.error(`Failed to schedule reminder for user ${userId}`);
  }
};

export const initializeAllReminders = async () => {
  const readingGoalRepo = handleGetRepository(ReadingGoal);
  const goals = await readingGoalRepo.find({
    relations: ['user']
  });

  for (const goal of goals) {
    if (goal.user?.expoPushToken) {
      await scheduleReminderForUser(goal.user.id);
    }
  }
};
