import { Response } from 'express';
import { BookEntity, ReadingLogEntity } from '../entities';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export const logReadingEvent = async (req: IExtendedRequest, res: Response) => {
  const { bookId, startTime, currentTime } = req.body;

  const readingLogRepository = handleGetRepository(ReadingLogEntity);
  const bookRepository = handleGetRepository(BookEntity);

  const book = await bookRepository.findOne({ where: { id: bookId } });

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  const start = new Date(startTime);
  const current = new Date(currentTime);
  const minutesRead = Math.round((current.getTime() - start.getTime()) / 60_000);

  const newReadingLog = readingLogRepository.create({
    user: { id: req.user.id },
    book: { id: bookId },
    startTime: start,
    currentTime: current,
    minutesRead
  });

  await readingLogRepository.save(newReadingLog);

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading event logged successfully',
    data: {
      id: newReadingLog.id,
      bookId: newReadingLog.book.id,
      startTime: newReadingLog.startTime,
      currentTime: newReadingLog.currentTime,
      minutesRead: newReadingLog.minutesRead
    }
  });
};
