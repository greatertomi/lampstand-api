import 'dotenv/config';

type EnvConfig = {
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  PORT: number;
  NODE_ENV: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  JWT_SECRET: string;
  MAILGUN_API_KEY: string;
  MAILGUN_API_URL: string;
  MAILGUN_DOMAIN: string;
  LOG_LEVEL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  REDIRECT_URL: string;
  ANDROID_CLIENT_ID: string;
  IOS_CLIENT_ID: string;
  SENTRY_DSN: string;
  SUPPORT_COMPLAINT_EMAIL: string;
  SUPPORT_FEEDBACK_EMAIL: string;
};

type ENV = Partial<EnvConfig> & {
  [K in keyof EnvConfig]: EnvConfig[K] | undefined;
};

const getConfig = (): ENV => ({
  PORT: Number(process.env.PORT),
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_DB: process.env.POSTGRES_DB,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_API_URL: process.env.MAILGUN_API_URL,
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
  LOG_LEVEL: process.env.LOG_LEVEL,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  REDIRECT_URL: process.env.REDIRECT_URL,
  ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
  IOS_CLIENT_ID: process.env.IOS_CLIENT_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SUPPORT_COMPLAINT_EMAIL: process.env.SUPPORT_COMPLAINT_EMAIL,
  SUPPORT_FEEDBACK_EMAIL: process.env.SUPPORT_FEEDBACK_EMAIL
});

const getSanitizedConfig = (config: ENV): EnvConfig => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as EnvConfig;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
