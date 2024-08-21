import { Response } from 'express';
import { BookEntity } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export const saveBook = async (req: IExtendedRequest, res: Response) => {
  const { title, author, format, cover } = req.body;

  const bookRepository = handleGetRepository(BookEntity);

  const newBook = bookRepository.create({
    title,
    author,
    cover,
    format,
    size: req.uploadedFile.bytes,
    url: req.uploadedFile.secure_url,
    owner: { id: req.user.id }
  });

  await bookRepository.save(newBook);

  res.status(HTTP_STATUS.OK).json({
    message: 'Book saved successfully',
    data: {
      id: newBook.id,
      title: newBook.title,
      link: newBook.url,
      size: newBook.size
    }
  });
};

export const getUserBooks = async (req: IExtendedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const bookRepository = handleGetRepository(BookEntity);

    const books = await bookRepository.find({
      where: { owner: { id: userId } }
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Books retrieved successfully',
      data: books
    });
  } catch (error) {
    logger.error('Error fetching books:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};
