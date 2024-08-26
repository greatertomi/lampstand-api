import { Response } from 'express';
import { BookEntity, BookFormat } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
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

export const updateBook = async (req: IExtendedRequest, res: Response) => {
  const { id } = req.params;
  const { title, author, format, cover } = req.body;
  const bookRepository = handleGetRepository(BookEntity);

  const book = await bookRepository.findOne({ where: { id } });

  if (!book) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Book not found' });
  }

  const updateData: Partial<BookEntity> = {
    title,
    author,
    cover,
    format: format as BookFormat
  };

  if (req.uploadedFile) {
    updateData.size = req.uploadedFile.bytes;
    updateData.url = req.uploadedFile.secure_url;
  }

  await bookRepository.update(id, updateData);

  const updatedBook = await bookRepository.findOne({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    message: 'Book updated successfully',
    data: updatedBook
  });
};

export const getUserBooks = async (req: IExtendedRequest, res: Response) => {
  const bookRepository = handleGetRepository(BookEntity);

  const books = await bookRepository.find({
    where: { owner: { id: req.user.id } }
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Books retrieved successfully',
    data: books
  });
};

export const deleteBook = async (req: IExtendedRequest, res: Response) => {
  const bookId = req.params.id;

  const bookRepository = handleGetRepository(BookEntity);

  const book = await bookRepository.findOne({
    where: { id: bookId, owner: { id: req.user.id } }
  });

  if (!book) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Book not found or you do not have permission to delete it'
    });
  }

  await bookRepository.delete(book.id);

  return res.status(HTTP_STATUS.OK).json({
    message: 'Book deleted successfully'
  });
};
