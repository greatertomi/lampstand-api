import { Router } from 'express';
import multer from 'multer';
import { getUserProfile, updateProfilePicture } from '../controllers/user.controller';
import { asyncMiddleware, checkJwt, uploadPictureValidationRules, validate } from '../middleware';
import { profilePictureUploadMiddleware } from '../middleware/picture-upload';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/profile-picture',
  checkJwt,
  upload.single('profilePicture'),
  profilePictureUploadMiddleware,
  uploadPictureValidationRules(),
  validate,
  asyncMiddleware(updateProfilePicture)
);

router.get('/me', checkJwt, asyncMiddleware(getUserProfile));

export default router;
