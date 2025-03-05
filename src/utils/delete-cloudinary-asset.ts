import cloudinary from '../config/cloudinary';
import { logger } from '../services';


const getPublicIdFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const uploadIndex = pathSegments.indexOf('upload');
    if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL');
    return pathSegments.slice(uploadIndex + 2).join('/');
  } catch (error) {
    logger.error(`Failed to get PublicId: ${error}`);
    throw new Error('Invalid URL format');

  }
};

export const deleteCloudinaryAsset = async (url: string): Promise<void> => {
  try {
    const publicId = getPublicIdFromUrl(url);

    const deleteResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true
    });

    if (deleteResponse.result !== 'ok') {
      const errorMessage = deleteResponse.error?.message || deleteResponse.result;
      logger.error(`Failed to delete file from Cloudinary: ${publicId}. Error: ${errorMessage}`);
      throw new Error(`Cloudinary deletion failed: ${errorMessage}`);
    }

    logger.info(`Asset deleted successfully from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Error during Cloudinary asset deletion:', error);
    throw error;
  }
};
