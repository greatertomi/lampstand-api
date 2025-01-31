import { Response } from 'express';
import { BookEntity, BookFormat } from '../entities';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import { EpubProcessor } from '../utils';
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
    throw new NotFoundError('Book not found');
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
  const bookRepository = handleGetRepository(BookEntity);

  const book = await bookRepository.findOne({
    where: { id: req.params.id, owner: { id: req.user.id } }
  });
  if (!book) {
    throw new NotFoundError('Book not found or you do not have permission to delete it');
  }
  await bookRepository.delete(book.id);

  return res.status(HTTP_STATUS.OK).json({
    message: 'Book deleted successfully'
  });
};

export const saveManyBooks = async (req: IExtendedRequest, res: Response) => {
  const uploadedFiles = req.uploadedFiles;

  const bookRepository = handleGetRepository(BookEntity);
  const newBooks: BookEntity[] = await Promise.all(
    uploadedFiles.map(async (uploadedFile) => {
      const bookPath = uploadedFile.secure_url;

      const processor = new EpubProcessor(bookPath);
      const processedData = await processor.process();
      const { title, creator } = processedData.metadata;
      const bookTitle = typeof title === 'string' ? title : title?.text || '';
      const author = typeof creator === 'string' ? creator : creator?.text || '';
      const coverImage = await processor.getBookImage(processedData.manifest);

      const fileFormat: BookFormat =
        (uploadedFile.format as BookFormat) ||
        (processor.getFileExtension(uploadedFile.secure_url) as BookFormat);

      await processor.cleanup();

      return bookRepository.create({
        title: bookTitle,
        author,
        cover: coverImage || null,
        format: fileFormat,
        size: uploadedFile.bytes,
        url: uploadedFile.secure_url,
        owner: { id: req.user.id }
      });
    })
  );

  const savedBooks = await bookRepository.save(newBooks);

  res.status(HTTP_STATUS.OK).json({
    message: 'Books saved successfully',
    data: savedBooks.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      link: book.url,
      size: book.size
    }))
  });
};
