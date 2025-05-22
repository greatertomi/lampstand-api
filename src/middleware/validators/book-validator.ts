import { body, param } from 'express-validator';
import { BookFormat } from '../../entities';

export const saveBookValidationRules = [
  body('id')
    .notEmpty()
    .withMessage('Id is required')
    .isUUID()
    .withMessage('Id must be a valid UUID'),
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
      if (value === '') return true;
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

export const saveMultipleBooksValidationRules = [
  body('ids').custom((_, { req }) => {
    const parsedIds = JSON.parse(req.body.ids);
    const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
    if (!Array.isArray(parsedIds)) {
      throw new TypeError('Must be an array');
    }
    const isValid = parsedIds.every((item) => typeof item === 'string' && uuidPattern.test(item));

    if (!isValid) {
      throw new Error('All items must be valid UUIDs');
    }

    const uniqueIds = new Set(parsedIds);
    if (uniqueIds.size !== parsedIds.length) {
      throw new Error('Duplicate UUIDs are not allowed');
    }

    return true;
  }),
  body('files').custom((_, { req }) => {
    const uploadedFiles = req.files;
    const { ids } = req.body;
    const newIds = JSON.parse(ids);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error('At least one file must be uploaded');
    }

    if (newIds.length !== uploadedFiles.length) {
      throw new Error('ids length should match uploaded files');
    }

    for (const file of uploadedFiles) {
      if (file && !file.mimetype.startsWith('application/epub')) {
        throw new Error('Uploaded file must be a EPUB');
      }

      const validExtensions = ['epub'];
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        throw new Error('No file extension found with file');
      }
    }
    return true;
  })
];

export const deleteManyBooksValidationRules = [
  body('ids')
    .exists({ values: 'null' })
    .withMessage('ids field is required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('Ids must be an array with at least one element')
    .bail()
    .custom((ids: string[]) => new Set(ids).size === ids.length)
    .withMessage('Duplicate IDs are not allowed'),

  body('ids.*')
    .isString()
    .withMessage('Each id must be a string')
    .bail()
    .isUUID()
    .withMessage('Each ID must be a valid UUID')
];
