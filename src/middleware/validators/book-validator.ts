import { body } from 'express-validator';
import { BookFormat } from '../../entities';

// TODO: Add validation for manifest and metadata fields
export const saveBookValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('format')
    .notEmpty()
    .withMessage('Format is required')
    .custom((value) => {
      if (!Object.values(BookFormat).includes(value)) {
        throw new Error('Invalid book format');
      }
      return true;
    }),
  body('cover')
    .optional()
    .custom((value) => {
      const base64Pattern = /^data:image\/(jpeg|jpg|png|gif);base64,[\d+/A-Za-z]+={0,2}$/;
      if (!base64Pattern.test(value)) {
        throw new Error('must be a valid Base64 encoded image');
      }
      return true;
    }),
  body().custom((value, { req }) => {
    const file = req.file;
    if (!file) {
      throw new Error('No file uploaded');
    }
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== req.body.format) {
      throw new Error('File extension does not match the specified format');
    }
    return true;
  })
];
