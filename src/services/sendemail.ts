import { mailgunClient } from '../config';
import { JwtHelper } from '../lib';
import { JwtPayload } from '../types';
import { logger } from './logger';

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export const sendVerificationEmail = async (user: JwtPayload) => {
  const verificationToken = JwtHelper.generateToken(user);
  const redirectURL = process.env.REDIRECT_URL;

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
        <a href="${redirectURL}/auth/verify-email?token=${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 4px;">
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
    logger.info('Verification email sent', {
      location: 'Email Service Controller',
      route: '/api/v1/signup'
    });
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
          To reset your password, use the following 4-digit code:
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
    logger.error({
      message: `Error sending password reset email: ${error.message}`,
      location: 'Send Reset Password Email',
      route: '/api/v1/reset-password'
    });
    throw error; // Rethrow the error so it can be handled in the calling function
  }
};

export const sendUserComplaintEmail = async (email: string, title: string, description: string) => {
  const mailData = {
    from: SENDER_EMAIL,
    to: SUPPORT_EMAIL,
    subject: `[Lampstand Support] ${title}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Customer Complaint: ${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 5px 5px 0 0;
          border-bottom: 2px solid #e9ecef;
        }
        .content {
          padding: 20px;
          background-color: #ffffff;
          border-radius: 0 0 5px 5px;
          border: 1px solid #e9ecef;
        }
        .user-info {
          background-color: #f1f8fe;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .complaint-details {
          background-color: #fff8f1;
          padding: 15px;
          border-left: 4px solid #ffc107;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #6c757d;
        }
        h1 {
          color: #2c3e50;
          margin-top: 0;
        }
        .label {
          font-weight: bold;
          color: #495057;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Customer Complaint</h1>
        <p>Lampstand App Support Ticket</p>
      </div>

      <div class="content">
        <div class="user-info">
          <p><span class="label">User Email:</span> ${email}</p>
          <p><span class="label">Complaint Type:</span> ${title}</p>
          <p><span class="label">Received:</span> ${new Date().toLocaleString()}</p>
        </div>

        <h2>Complaint Details</h2>
        <div class="complaint-details">
          <p>${description.replace(/\n/g, '<br>')}</p>
        </div>

        <div class="footer">
          <p>Please respond to this complaint within 24 hours. You can reply directly to this email or use our support dashboard.</p>
          <p>Priority: <strong>Normal</strong> (Escalate if urgent)</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailData);
    logger.info({
      message: `Complaint email sent successfully for user ${email}`,
      complaintType: title,
      route: '/api/v1/support/complaint'
    });
  } catch (error) {
    logger.error({
      message: `Error sending complaint email for ${email}: ${error.message}`,
      errorDetails: error.stack,
      complaintType: title,
      route: '/api/v1/support/complaint'
    });
    throw new Error('Failed to send complaint notification. Please try again later.');
  }
};

export const sendUserFeedbackEmail = async (
  email: string,
  title: string,
  description: string,
  images?: Array<{ filename: string; content: Buffer; contentType: string }>
  // eslint-disable-next-line max-params
) => {
  const hasImages = Array.isArray(images) && images.length > 0;

  const attachments = hasImages
    ? images.map((img, index) => ({
        filename: img.filename || `feedback-image-${index}.jpg`,
        data: img.content,
        contentType: img.contentType,
        'Content-ID': `<feedback-image-${index}>`
      }))
    : undefined;

  const mailData = {
    from: SENDER_EMAIL,
    to: SUPPORT_EMAIL,
    subject: `[Lampstand Feedback] ${title}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>User Feedback: ${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f0f7ff;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            border-bottom: 2px solid #d4edff;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
            border-radius: 0 0 5px 5px;
            border: 1px solid #e9ecef;
          }
          .user-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .feedback-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #4dabf7;
            margin-bottom: 20px;
          }
          .image-container {
            margin-top: 20px;
          }
          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 10px;
          }
          .image-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }
          .image-item img {
            width: 100%;
            height: auto;
            display: block;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #6c757d;
          }
          h1 {
            color: #1971c2;
            margin-top: 0;
          }
          h2 {
            color: #2c3e50;
            margin-top: 0;
          }
          .label {
            font-weight: bold;
            color: #495057;
          }
          .no-images {
            font-style: italic;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New User Feedback</h1>
          <p>Lampstand App Feedback Submission</p>
        </div>

        <div class="content">
          <div class="user-info">
            <p><span class="label">User Email:</span> ${email}</p>
            <p><span class="label">Feedback Type:</span> ${title}</p>
            <p><span class="label">Received:</span> ${new Date().toLocaleString()}</p>
          </div>

          <h2>Feedback Details</h2>
          <div class="feedback-details">
            <p>${description.replace(/\n/g, '<br>')}</p>
          </div>

          <div class="image-container">
            <h2>Attached Screenshots</h2>
            ${
              hasImages
                ? `
                <div class="image-grid">
                  ${images
                    .map(
                      (_, index) => `
                    <div class="image-item">
                      <img src="cid:feedback-image-${index}" alt="Attached screenshot">
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                : '<p class="no-images">No images were attached.</p>'
            }
          </div>

          <div class="footer">
            <p>This feedback has been automatically logged in our system. No response required unless specifically requested by the user.</p>
            <p>Review priority: <strong>Standard</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
    ...(attachments && { attachment: attachments })
  };

  try {
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailData as never);

    logger.info(`Feedback email sent successfully for user: ${email}`);
  } catch (error) {
    logger.error({
      message: `Error sending feedback email for ${email}: ${error.message}`,
      errorDetails: error.stack,
      feedbackType: title,
      route: '/api/v1/support/feedback'
    });
    throw new Error('Failed to send feedback notification. Please try again later.');
  }
};
