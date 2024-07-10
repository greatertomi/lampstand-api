import { Request, Response } from 'express';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { UserEntity } from '../entities';
import { BookEntity, BookFormat } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';

export const uploadBook = async (req: Request, res: Response) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  if (!cloudinary.config().api_key) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server configuration error' });
  }

  const file = req.file;
  const { title, author, ownerId, format, metadata, manifest, size } = req.body;

  if (!file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'No file uploaded' });
  }

  const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw' }, (error, result) => {
      if (error) reject(error);
      else resolve(result as UploadApiResponse);
    });
    stream.end(file.buffer);
  });

  const userRepository = handleGetRepository(UserEntity);
  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Owner not found' });
  }

  const bookRepository = handleGetRepository(BookEntity);
  const newBook = bookRepository.create({
    id: undefined,
    title,
    author,
    owner,
    cover: '',
    format: format as BookFormat,
    metadata: JSON.parse(metadata),
    manifest: JSON.parse(manifest),
    size: Number.parseInt(size, 10),
    url: uploadResult.secure_url
  });

  await bookRepository.save(newBook);

  res.status(HTTP_STATUS.OK).json({ message: 'Book uploaded successfully', book: newBook });
};
