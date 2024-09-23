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
  SYNC_DATABASE: boolean;
  LOG_LEVEL: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
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
  SYNC_DATABASE: process.env.SYNC_DATABASE === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET
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
