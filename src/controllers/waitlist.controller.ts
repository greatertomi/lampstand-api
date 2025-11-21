import { Request, Response } from 'express';
import { WaitlistEntity } from '../entities';
import { BadRequestError, HTTP_STATUS, NotFoundError } from '../lib/responses';
import { sendAndroidTesterInviteEmail } from '../services';
import handleGetRepository from '../utils/handleGetRepository';

export const saveWaitlistEmail = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  const waitlistRepo = handleGetRepository(WaitlistEntity);

  const existingUser = await waitlistRepo.findOne({
    where: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    throw new BadRequestError('User has already signed up for the waitlist');
  }

  const newUser = waitlistRepo.create({ email, phoneNumber, isVerified: false });
  await waitlistRepo.save(newUser);

  await sendAndroidTesterInviteEmail(email);

  const whatsappInviteLink = process.env.WHATSAPP_GROUP_INVITE_LINK;

  return res
    .status(HTTP_STATUS.CREATED)
    .send({ message: 'Waitlist Email saved successfully', data: { email, phoneNumber, whatsappInviteLink } });
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
