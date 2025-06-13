import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import envConfig from './config/envConfig';
import { AppDataSource } from './database';
import { errorHandler, responseLogger } from './middleware';
import routes from './routes';
import homepageRouter from './routes/homepage.route';
import { logger } from './services';
import './services/google-passport';

const { PORT } = envConfig;

export const main = async () => {
  try {
    await AppDataSource.initialize();
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());

    app.use(passport.initialize());

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
