import { body, param } from 'express-validator';
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
  body('cover')
    .optional()
    .custom((value) => {
      const base64Pattern = /^data:image\/(jpeg|jpg|png|gif);base64,[\d+/A-Za-z]+={0,2}$/;
      if (!base64Pattern.test(value)) {
        throw new Error('must be a valid Base64 encoded image');
      }
      return true;
    }),
  body('file').custom((_, { req }) => {
    const file = req.file;
    if (!file) {
      throw new Error('No file uploaded');
    }
    return true;
  })
];

export const updateBookValidationRules = [
  param('id').notEmpty().withMessage('ID is required'),
  body('title').optional().notEmpty().withMessage('Title is required'),
  body('author').optional().notEmpty().withMessage('Author is required'),
  body('format')
    .optional()
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
  body('file')
    .optional()
    .custom((_, { req }) => {
      const file = req.file;
      if (file && !file.mimetype.startsWith('application/pdf')) {
        throw new Error('Uploaded file must be a PDF');
      }
      return true;
    })
];
