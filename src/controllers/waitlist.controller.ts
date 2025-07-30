import { Request, Response } from 'express';
import { WaitlistEntity } from '../entities';
import { BadRequestError, HTTP_STATUS, NotFoundError } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';

export const saveWaitlistEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  const waitlistRepo = handleGetRepository(WaitlistEntity);

  const existingUser = await waitlistRepo.findOne({ where: { email } });

  if (existingUser) {
    throw new BadRequestError('User has already signed up for the waitlist');
  }

  const newUser = waitlistRepo.create({ email, isVerified: false });
  await waitlistRepo.save(newUser);

  return res
    .status(HTTP_STATUS.CREATED)
    .send({ message: 'Waitlist Email saved successfully', data: { email } });
};

export const checkWaitlistEmail = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }

  const waitlistRepo = handleGetRepository(WaitlistEntity);
  const existingUser = await waitlistRepo.findOne({ where: { email } });

  return res.status(HTTP_STATUS.OK).send({
    exists: !!existingUser,
    message: existingUser ? 'Email exists in waitlist' : 'Email not found in waitlist',
    data: existingUser || null
  });
};

export const verifyWaitlistEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Email is required');
  }

  const waitlistRepo = handleGetRepository(WaitlistEntity);
  const user = await waitlistRepo.findOne({ where: { email } });

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
