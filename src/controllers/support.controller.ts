import { Request, Response } from 'express';
import { HTTP_STATUS } from '../lib/responses';
import { sendUserComplaintEmail, sendUserFeedbackEmail } from '../services';

export const complaintMessage = async (req: Request, res: Response) => {
  const { email, title, description } = req.body;
  await sendUserComplaintEmail(email, title, description);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Complaint Email sent successfully' });
};

export const feedbackMessage = async (req: Request, res: Response) => {
  const { email, title, description } = req.body;
  const files = req.files as Express.Multer.File[];

  const imageAttachments =
    files?.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    })) || [];
  await sendUserFeedbackEmail(email, title, description, imageAttachments);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Feedback Email sent successfully' });
};
