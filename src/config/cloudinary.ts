import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../services';
import envConfig from './envConfig';

logger.info(`Configuring Cloudinary with cloud name: ${envConfig.CLOUDINARY_CLOUD_NAME}`);

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET
});

if (
  !cloudinary.config().cloud_name ||
  !cloudinary.config().api_key ||
  !cloudinary.config().api_secret
) {
  throw new Error('Cloudinary configuration error');
}

export { v2 as default } from 'cloudinary';
