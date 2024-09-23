import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import '../src/config/passportConfig';
import envConfig from './config/envConfig';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';
import routes from './routes';
import { logger } from './services';

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
    app.use(passport.session());

    app.use('/', routes);

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
