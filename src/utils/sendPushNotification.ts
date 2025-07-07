import { Expo } from 'expo-server-sdk';
import { logger } from '../services';

interface PushNotificationProps {
  title: string;
  body: string;
  expoPushToken: string;
}

export const sendPushNotification = async ({
  title,
  body,
  expoPushToken
}: PushNotificationProps) => {
  const expo = new Expo();
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body
  };

  const chunks = expo.chunkPushNotifications([message]);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      logger.error('Error sending push notifications:', error);
    }
  }

  return tickets;
};
