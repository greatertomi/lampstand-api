import winston from 'winston';
import envConfig from '../config/envConfig';

const colorsConfig = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'cyan'
};

const colorizer = winston.format.colorize({ all: true, colors: colorsConfig });

const consoleServerLogs = winston.format.combine(
  winston.format((info) => {
    if (info.location) {
      const allowedFields = new Set([
        'level',
        'location',
        'route',
        'message',
        'status',
        'headers',
        'body',
        'responseTime'
      ]);
      for (const key of Object.keys(info)) {
        if (!allowedFields.has(key)) {
          delete info[key];
        }
      }
    }
    return info;
  })(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, location, route }) => {
    const coloredLevel = colorizer.colorize(level, `[${level.toUpperCase()}]`);
    const logParts = [`${timestamp} ${coloredLevel}:`];

    if (location) {
      logParts.push(`[${location}]`);
    }

    if (route) {
      logParts.push(`${route}`);
    }

    logParts.push(message);

    return logParts.join(' ').trim();
  })
);

export const logger = winston.createLogger({
  level: envConfig.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...args }) => {
      const coloredLevel = colorizer.colorize(level, `[${level.toUpperCase()}]`);
      return `${timestamp} ${coloredLevel}: ${message} ${
        Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: consoleServerLogs }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ level, message, timestamp, ...args }) => {
          return JSON.stringify({ timestamp, level, message, ...args });
        })
      )
    })
  ]
});
