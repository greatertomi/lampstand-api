import { Router } from 'express';
import multer from 'multer';
import { getUserProfile, removeAccount, updateProfilePicture, updateUser } from '../controllers';
import {
  asyncMiddleware,
  checkJwt,
  profilePictureUploadMiddleware,
  updateUserValidationRules,
  uploadPictureValidationRules,
  validate
} from '../middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.put(
  '/profile-picture',
  checkJwt,
  upload.single('profilePicture'),
  profilePictureUploadMiddleware,
  uploadPictureValidationRules(),
  validate,
  asyncMiddleware(updateProfilePicture)
);
router.delete('/remove-account', checkJwt, asyncMiddleware(removeAccount));

router.get('/me', checkJwt, asyncMiddleware(getUserProfile));

router.put(
  '/update-me',
  checkJwt,
  updateUserValidationRules(),
  validate,
  asyncMiddleware(updateUser)
);

export default router;
