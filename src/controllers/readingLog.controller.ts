import { Response } from 'express';
import { Between, FindOptionsWhere } from 'typeorm';
import { BookEntity, ReadingLogEntity } from '../entities';
import { getDateRange } from '../lib';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import { TimeSpan } from '../types/timespan';
import handleGetRepository from '../utils/handleGetRepository';

export const logReadingEvent = async (req: IExtendedRequest, res: Response) => {
  const { bookId, startTime, endTime } = req.body;

  const readingLogRepository = handleGetRepository(ReadingLogEntity);
  const bookRepository = handleGetRepository(BookEntity);

  const book = await bookRepository.findOne({ where: { id: bookId } });

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const secondsRead = Math.round((end.getTime() - start.getTime()) / 1000);

  const newReadingLog = readingLogRepository.create({
    user: { id: req.user.id },
    book: { id: bookId },
    startTime: start,
    endTime: end,
    secondsRead
  });

  await readingLogRepository.save(newReadingLog);


  res.status(HTTP_STATUS.OK).json({
    message: 'Reading event logged successfully',
    data: {
      id: newReadingLog.id,
      bookId: newReadingLog.book.id,
      startTime: newReadingLog.startTime,
      endTime: newReadingLog.endTime,
      secondsRead: newReadingLog.secondsRead
    }
  });
};

export const getUserReadingLogs = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const { timespan } = req.query;
  const userId = req.user.id;

  const readingLogRepository = handleGetRepository(ReadingLogEntity);

  const whereCondition: FindOptionsWhere<ReadingLogEntity> = {
    user: { id: userId }
  };

  if (timespan) {
    const dateRange = getDateRange(timespan as TimeSpan);
    if (dateRange) {
      whereCondition.startTime = Between(dateRange.start, dateRange.end);
    }
  }

  const readingLogs = await readingLogRepository.find({
    where: whereCondition,
    relations: ['book'],
    order: { startTime: 'DESC' }
  });


  res.status(HTTP_STATUS.OK).json({
    message: 'Reading logs fetched successfully',
    data: readingLogs.map((log) => ({
      id: log.id,
      bookId: log.book.id,
      bookTitle: log.book.title,
      startTime: log.startTime,
      endTime: log.endTime,
      secondsRead: log.secondsRead
    }))
  });
};
