import { NextFunction, Request, Response } from 'express';
import { logger } from '../services';


const sensitiveKeys = new Set(['authorization', 'cookie', 'token', 'accessToken', 'refreshToken']);

const sanitizeData = (data: unknown): unknown => {
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return sanitizeData(parsedData);
    } catch {
      return data;
    }
  }

  return typeof data === 'object' && data !== null
    ? (Array.isArray(data)
      ? data.map((item) => sanitizeData(item))
      : Object.fromEntries(
          Object.entries(data)
            .filter(([key]) => !sensitiveKeys.has(key.toLowerCase()))
            .map(([key, value]) => [key, sanitizeData(value)]))
        )
    : data;
};

export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const maskedHeaders = sanitizeData(req.headers as Record<string, string>);
  const requestMessage = 'API request received';
  const responseMessage = 'API response sent';

  logger.info(requestMessage, {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: maskedHeaders,
    ip: req.ip,
    requestId: '',
    location: 'Request Middleware',
    route: `${req.method} ${req.path}`
  });

  let responseBody: unknown;

  const originalSend = res.send;

  res.send = function (...args: unknown[]) {
    responseBody = args[0];
    return Reflect.apply(originalSend, this, args);
  };

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    const logLevel: string =
      res.statusCode >= 500 ? 'error' : (res.statusCode >= 400 ? 'warn' : 'info');

    const sanitizedBody = sanitizeData(responseBody);

    logger[logLevel](responseMessage, {
      status: res.statusCode,
      headers: sanitizeData(res.getHeaders() as Record<string, string>),
      body: sanitizedBody,
      responseTime,
      location: 'Response Middleware',
      responseId: '',
      route: `${res.statusCode} ${req.method} ${req.path}`
    });

  });
  next();
};
