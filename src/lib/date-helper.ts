export function getDateRange(timespan: string): { start: Date; end: Date } | null {
  const end = new Date();
  const start = new Date();

  switch (timespan) {
    case 'today': {
      start.setHours(0, 0, 0, 0);

      break;
    }
    case 'last7days': {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      break;
    }
    case 'last30days': {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);

      break;
    }
    default: {
      return null;
    }
  }

  return { start, end };
}
