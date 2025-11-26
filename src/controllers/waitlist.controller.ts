import { Request, Response } from 'express';
import envConfig from '../config/envConfig';
import { WaitlistEntity } from '../entities';
import { BadRequestError, HTTP_STATUS, NotFoundError } from '../lib/responses';
import { sendAndroidTesterInviteEmail } from '../services';
import handleGetRepository from '../utils/handleGetRepository';

const { WHATSAPP_GROUP_INVITE_LINK } = envConfig;

export const saveWaitlistEmail = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  const waitlistRepo = handleGetRepository(WaitlistEntity);

  const existingUserByEmail = await waitlistRepo.findOneBy({ email });

  if (existingUserByEmail) {
    if (existingUserByEmail.phoneNumber === phoneNumber) {
      throw new BadRequestError('User has already signed up for the waitlist');
    }

    const existingUserByPhone = await waitlistRepo.findOneBy({ phoneNumber });
    if (existingUserByPhone) {
      throw new BadRequestError('Phone number is already registered');
    }

    existingUserByEmail.phoneNumber = phoneNumber;
    await waitlistRepo.save(existingUserByEmail);

    return res.status(HTTP_STATUS.OK).send({
      message: 'Waitlist updated successfully',
      data: { email, phoneNumber, whatsappInviteLink: WHATSAPP_GROUP_INVITE_LINK }
    });
  }

  const newUser = waitlistRepo.create({ email, phoneNumber, isVerified: false });
  await waitlistRepo.save(newUser);

  await sendAndroidTesterInviteEmail(email);

  return res.status(HTTP_STATUS.CREATED).send({
    message: 'Waitlist Email saved successfully',
    data: { email, phoneNumber, whatsappInviteLink: WHATSAPP_GROUP_INVITE_LINK }
  });
};

export const checkWaitlistEmail = async (req: Request, res: Response) => {
  const email = req.query.email as string;

  const waitlistRepo = handleGetRepository(WaitlistEntity);
  const existingUser = await waitlistRepo.findOneBy({ email });

  return res.status(HTTP_STATUS.OK).send({
    exists: !!existingUser,
    message: existingUser ? 'Email exists in waitlist' : 'Email not found in waitlist',
    data: existingUser || null
  });
};

export const verifyWaitlistEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  const waitlistRepo = handleGetRepository(WaitlistEntity);
  const user = await waitlistRepo.findOneBy({ email });

  if (!user) {
    throw new NotFoundError('Email not found in waitlist');
  }

  if (user.isVerified) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email already verified',
      data: { email, isVerified: true }
    });
  }

  user.isVerified = true;
  await waitlistRepo.save(user);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Email verified successfully',
    data: { email, isVerified: true }
  });
};
