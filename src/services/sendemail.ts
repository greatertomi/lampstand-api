import { mailgunClient } from '../config';
import { JwtHelper } from '../lib';
import { JwtPayload } from '../types';
import { logger } from './logger';

const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const sendVerificationEmail = async (user: JwtPayload) => {
  const verificationToken = JwtHelper.generateToken(user);

  const mailData = {
    from: SENDER_EMAIL,
    to: user.email,
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
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailData);
    logger.info('Verification email sent', { location: 'Email Service Controller', route: '/api/v1/signup' });
  } catch (error) {
    logger.error({
      message: `Error sending verification email: ${error.message}`,
      location: 'Email Service Controller',
      route: '/api/v1/signup'
    });
  }
};

export const sendPasswordResetEmail = async (email: string, token: number) => {
  const mailData = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Reset Your Password',
    html: `
    <html lang="">
      <head>
        <title>Reset Your Password - Lampstand</title>
      </head>
      <body>
        <h1 style="color: #333333; font-family: Arial, sans-serif;">Password Reset Request</h1>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
        </p>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          To reset your password, use the following 6-digit code:
        </p>
        <h2 style="font-family: Arial, sans-serif; font-size: 24px; color: #007bff; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
          ${token}
        </h2>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          This code will expire in 12 hours for security reasons. If you need to reset your password after that, please request a new code.
        </p>
        <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          If you didn't request a password reset, please contact our support team immediately.
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
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailData);
  } catch (error) {
    logger.error( {
      message: `Error sending password reset email: ${error.message}`,
      location: 'Send Reset Password Email',
      route: '/api/v1/reset-password'
    });
    throw error; // Rethrow the error so it can be handled in the calling function
  }
};
