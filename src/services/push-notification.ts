import { Repository } from 'typeorm';
import Expo from 'expo-server-sdk';
import { UserPushTokenEntity } from '../entities';
import handleGetRepository from '../utils/handleGetRepository';
import { logger } from './logger';

type SendPushNotificationParams = {
  title: string;
  body: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  tokens: string[];
};

export class PushNotificationService {
  private expo: Expo;
  private pushTokenRepo: Repository<UserPushTokenEntity>;

  constructor() {
    this.expo = new Expo();
    this.pushTokenRepo = handleGetRepository(UserPushTokenEntity);
  }

  async sendPushNotification({ title, body, data, tokens }: SendPushNotificationParams) {
    const messages = [];

    for (const pushToken of tokens) {
      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high'
      });
    }

    // Split messages into chunks for batch sending
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error('Error sending push notification chunk:', error);
      }
    }

    return tickets;
  }

  async sendToAllUsers({ title, body, data = {} }: Omit<SendPushNotificationParams, 'tokens'>) {
    const tokens = await this.getAllPushTokens();
    return this.sendPushNotification({ tokens, title, body, data });
  }

  async sendToUser({
    userId,
    title,
    body,
    data = {}
  }: Omit<SendPushNotificationParams, 'tokens'> & { userId: string }) {
    const tokens = await this.getUserPushTokens(userId); // Implement this method
    return this.sendPushNotification({ tokens, title, body, data });
  }

  private async getAllPushTokens(): Promise<string[]> {
    const userPushTokens = await this.pushTokenRepo.find();
    return userPushTokens.map((token) => token.pushToken);
  }

  private async getUserPushTokens(userId: string): Promise<string[]> {
    const userPushTokens = await this.pushTokenRepo.findBy({ user: { id: userId } });
    return userPushTokens.map((token) => token.pushToken);
  }
}
