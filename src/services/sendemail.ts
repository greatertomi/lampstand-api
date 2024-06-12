
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { JwtHelper } from '../lib';
import { logger } from './logger';
import envConfig from '../config/envConfig';

const mailgun = new Mailgun(FormData); //

const mg = mailgun.client({
  username: 'api',
  key: envConfig.MAILGUN_API_KEY,
  url: envConfig.MAILGUN_API_URL,
});

export const sendVerificationEmail = async (email: string, userId: string) => {
  const verificationToken = JwtHelper.generateToken(userId);

  const mailData = {
    from: 'caleboshalusi@gmail.com',
    to: email,
    subject: 'Verify your email address',
    html: `
    <html lang="">
      <head>
        <title>Welcome to Lampstand!</title>
      </head>
      <body>
        <h1 style="color: #333333; font-family: Arial, sans-serif;">Welcome to Our Platform!</h1>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          Thank you for signing up! We're excited to have you on board. Before you can start using our platform, we need to verify your email address. This helps us ensure the security of your account and protect you from unauthorized access.
        </p>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          Please click the following link or copy and paste it into your browser to verify your email address:
        </p>
        <a href="http://localhost:8000/auth/verify-email?token=${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 4px;">
          Verify Email
        </a>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          If you didn't sign up for our platform, please disregard this email.
        </p>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          Best regards,<br>
          The Lampstand Team
        </p>
      </body>
    </html>
  `
  };

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, mailData);
    logger.info('Verification email sent');
  } catch (error) {
    logger.error('Error sending verification email:', error);
  }
};
