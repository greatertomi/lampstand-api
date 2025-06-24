import * as Sentry from '@sentry/node';
import envConfig from './config/envConfig';

Sentry.init({
  dsn: envConfig.SENTRY_DSN,
  integrations: [Sentry.httpIntegration()],
  // eslint-disable-next-line unicorn/no-zero-fractions
  tracesSampleRate: 1.0,
  beforeSend: (event) => envConfig.NODE_ENV === 'production' ? event : null

});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { AppDataSource } from './database';
import { errorHandler, responseLogger } from './middleware';
import routes from './routes';
import homepageRouter from './routes/homepage.route';
import { logger } from './services';
import './services/google-passport';
const { PORT } = envConfig;

export const main = async () => {
  try {
    try {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully 🚀');
    } catch (error) {
      logger.error('Failed to initialize AppDataSource:', error);
    }
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());

    app.use(passport.initialize());

    Sentry.setupExpressErrorHandler(app);
    app.use(responseLogger);
    app.use('/', homepageRouter);
    app.use('/api/v1', routes);

    app.use((req, res) =>
      res.status(404).send({
        message: `This route does not exist: [${req.method}] ${req.url}`
      })
    );
    app.use(errorHandler);

    app.listen(PORT, () => {
      logger.info(`Server listening on port http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(error);
  }
};

main();
