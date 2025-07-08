import express from 'express';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Server, createServer } from 'node:http';
import { createDatabase } from 'typeorm-extension';
import { TestDataSource, testDatabaseConfig } from '../src/database';
import { errorHandler } from '../src/middleware';
import routes from '../src/routes';
import { logger } from '../src/services';
import { userScheduledJobs } from '../src/services/cron-jobs';

export class TestFactory {
  private _app: express.Application;
  _connection: DataSource;
  private _server: Server;

  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app);
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  public async close(): Promise<void> {
    for (const job of userScheduledJobs.values()) {
      job.cancel();
    }    userScheduledJobs.clear();
    this._server.close();
    await this._connection.destroy();
  }

  private async startup(): Promise<void> {
    try {
      this._connection = TestDataSource;
      await createDatabase({
        options: {
          type: 'postgres' as const,
          ...testDatabaseConfig
        }
      });
      await this._connection.initialize();
      this._app = express();
      this._app.use(express.json());
      this._app.use(express.urlencoded({ extended: true }));
      jest.mock('../src/services/cron-jobs', () => ({
        initializeAllReminders: jest.fn().mockResolvedValue(null),
        scheduleReminderForUser: jest.fn(),
        userScheduledJobs: new Map(),
        cancelExistingJob: jest.fn()
      }));
      this._app.use('/', routes);
      this._app.use(errorHandler);
      this._server = createServer(this._app).listen(3010);
    } catch (error) {
      logger.error('testing error', error);
    }
  }
}
