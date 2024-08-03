import { Response } from 'express';
import { BookEntity } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export const saveBook = async (req: IExtendedRequest, res: Response) => {
  const { title, author, format, metadata, manifest, cover } = req.body;

  const bookRepository = handleGetRepository(BookEntity);

  const newBook = bookRepository.create({
    title,
    author,
    cover,
    format,
    metadata: structuredClone(metadata),
    manifest: structuredClone(manifest),
    size: req.uploadedFile.bytes,
    url: req.uploadedFile.secure_url,
    owner: { id: req.user.id }
  });

  await bookRepository.save(newBook);

  res.status(HTTP_STATUS.OK).json({
    message: 'Book uploaded successfully',
    data: {
      id: newBook.id,
      title: newBook.title,
      link: newBook.url,
      size: newBook.size
    }
  });
};
