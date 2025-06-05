import { Response } from 'express';
import cloudinary from '../config/cloudinary';
import { NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';

export type PreInstalledBook = {
  assest_id: string;
  filename: string;
  secure_url: string;
  url: string;
  format: string;
  bytes: number;
  created_at: string;
};

export const getPreinstalledBooks = async (_: IExtendedRequest, res: Response) => {
  const result = await cloudinary.search
    .expression('folder:preinstalledbooks')
    .with_field('context')
    .max_results(100)
    .execute();

  if (!result.resources || result.resources.length === 0) {
    throw new NotFoundError('Preinstalled books not found');
  }

  const books = result.resources.map((resource: PreInstalledBook) => ({
    id: resource.assest_id,
    filename: resource.filename,
    secure_url: resource.secure_url,
    url: resource.url,
    format: resource.format,
    size: resource.bytes,
    uploadedAt: resource.created_at
  }));

  res.json(books);
};
