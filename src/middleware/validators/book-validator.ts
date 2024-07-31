import { body } from 'express-validator';
import { BookFormat } from '../../entities';

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
  body('metadata').custom((value) => {
    let metadata = value;
    if (typeof value === 'string') {
      try {
        metadata = JSON.parse(value);
      } catch {
        throw new Error('Metadata must be a valid JSON string or object');
      }
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new Error('Metadata must be a valid object');
    }
    return true;
  }),
  body('manifest').custom((value) => {
    let manifest = value;
    if (typeof value === 'string') {
      try {
        manifest = JSON.parse(value);
      } catch {
        throw new Error('Manifest must be a valid JSON string or object');
      }
    }
    if (!manifest || !Array.isArray(manifest)) {
      throw new Error('Manifest must be a valid array');
    }
    return true;
  }),
  body('cover')
    .optional()
    .custom((value) => {
      // Regular expression to check if the string is a Base64 encoded image
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
