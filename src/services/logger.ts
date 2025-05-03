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
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, location, route }) => {
    return [
      timestamp,
      colorizer.colorize(level, `[${level.toUpperCase()}]`),
      location ? `[${location}]` : '',
      route || '',
      message
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  })
);

export const logger = winston.createLogger({
  level: envConfig.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: envConfig.NODE_ENV === 'production' ? winston.format.json() : consoleServerLogs
    }),
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
