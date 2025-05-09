import { ReadingLogEntity } from '../entities';

export const splitReadSecondsIntoHour = (readingLogs: ReadingLogEntity[]) => {
  const hourlyReadings = Array.from({ length: 24 }, (_, hour) => ({
    value: 0,
    label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour < 12 ? 'am' : 'pm'}`
  }));

  for (const log of readingLogs) {
    const startTime = new Date(log.startTime);
    const endTime = new Date(log.endTime);
    const totalSecondsRead = log.secondsRead;

    const totalTimeSpanInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    if (totalTimeSpanInSeconds === 0) continue;

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const currentHour = currentTime.getUTCHours();
      const nextHourTime = new Date(currentTime);
      nextHourTime.setUTCHours(currentHour + 1, 0, 0, 0);

      const timeUntilNextHour = Math.min(endTime.getTime(), nextHourTime.getTime());
      const secondsInThisHour = (timeUntilNextHour - currentTime.getTime()) / 1000;
      const timeShare = secondsInThisHour / totalTimeSpanInSeconds;

      hourlyReadings[currentHour].value += Math.round(totalSecondsRead * timeShare);

      currentTime = new Date(timeUntilNextHour);
    }
  }

  return hourlyReadings;
};
