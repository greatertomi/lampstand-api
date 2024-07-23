import { Response } from 'express';
import { BookEntity, BookFormat, UserEntity } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types/uploadfileextends';
import handleGetRepository from '../utils/handleGetRepository';

export const saveBook = async (req: IExtendedRequest, res: Response) => {
  const { title, author, ownerId, format, metadata, manifest, size } = req.body;

  const userRepository = handleGetRepository(UserEntity);
  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Owner not found' });
  }

  const bookRepository = handleGetRepository(BookEntity);

  const newBook = bookRepository.create({
    title,
    author,
    owner,
    cover: '',
    format: format as BookFormat,
    metadata: JSON.parse(metadata),
    manifest: JSON.parse(manifest),
    size: Number.parseInt(size, 10),
    url: req.uploadedFile.secure_url
  });

  await bookRepository.save(newBook);

  res.status(HTTP_STATUS.OK).json({ message: 'Book uploaded successfully', book: newBook });
};
