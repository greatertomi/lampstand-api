import Expo from 'expo-server-sdk';
import { logger } from '../services';
import handleGetRepository from './handleGetRepository';
import { PushTokenEntity } from '../entities';


const expo = new Expo();

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string
) => {

  const pushTokenRepository = handleGetRepository(PushTokenEntity);

  const userPushToken = await pushTokenRepository.findOne({
    where: { userId }
  });

  if (!userPushToken || !Expo.isExpoPushToken(userPushToken.expoPushToken)) {
    throw new Error('Invalid Expo push token');
  }

  const message = {
    to: userPushToken.expoPushToken,
    sound: 'default',
    title,
    body
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);

    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
      logger.info('Push Notification sent successfully', {
        location: 'PushNotificationMiddleware'
      });
    }
  } catch (error) {
    logger.info(`Error sending push Notification: ${error}`, {
      location: 'PushNotificationMiddleware'
    });
  }
};

export const saveOrUpdatePushToken = async (userId: string, PushToken: string) => {
  const pushTokenRepository = handleGetRepository(PushTokenEntity);

  const existingToken = await pushTokenRepository.findOne({ where: { userId } });

  if (existingToken) {
    existingToken.expoPushToken = PushToken;
    await pushTokenRepository.save(existingToken);
  } else {
    const newToken = pushTokenRepository.create({ userId, expoPushToken: PushToken });
    await pushTokenRepository.save(newToken);
  }
};
