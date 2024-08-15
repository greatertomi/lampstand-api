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
    const bookRepository = handleGetRepository(BookEntity);

    const books = await bookRepository.find({
      where: { owner: { id: req.user.id } }
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

export const deleteBook = async (req: IExtendedRequest, res: Response) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?.id;

    if (!bookId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Book ID is required'
      });
    }

    const bookRepository = handleGetRepository(BookEntity);

    const book = await bookRepository.findOne({
      where: { id: bookId, owner: { id: userId } }
    });

    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Book not found or you do not have permission to delete it'
      });
    }

    await bookRepository.remove(book);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting book:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};
