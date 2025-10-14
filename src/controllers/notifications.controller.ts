import { Request, Response } from 'express';
import { In } from 'typeorm';
import { UserPushTokenEntity } from '../entities';
import { PushNotificationService } from '../services';
import handleGetRepository from '../utils/handleGetRepository';

export const registerUpdatePushToken = async (req: Request, res: Response) => {
  const { userId, pushToken, platform } = req.body;

  const userPushTokenRepository = handleGetRepository(UserPushTokenEntity);

  await userPushTokenRepository.upsert(
    {
      user: { id: userId },
      pushToken,
      platform
    },
    {
      conflictPaths: ['user'],
      skipUpdateIfNoValuesChanged: true
    }
  );

  return res.send({ message: 'Push token registered successfully' });
};

export const sendNotification = async (req: Request, res: Response) => {
  const { title, body, data, userIds } = req.body;

  const pushNotificationService = new PushNotificationService();
  const userPushTokenRepository = handleGetRepository(UserPushTokenEntity);

  let tickets;
  if (userIds && userIds.length > 0) {
    const userTokens = await userPushTokenRepository.findBy({ user: { id: In(userIds) } });
    const tokens = userTokens.map((ut) => ut.pushToken);
    tickets = await pushNotificationService.sendPushNotification({ tokens, title, body, data });
  } else {
    tickets = await pushNotificationService.sendToAllUsers({ title, body, data });
  }

  res.json({ message: 'notification sent', data: tickets });
};
