import { DataSource, DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import envConfig from '../config/envConfig';

const isSyncDatabase = envConfig.SYNC_DATABASE;

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  url: envConfig.DATABASE_URL,
  synchronize: isSyncDatabase,
  logging: false,
  entities: isSyncDatabase ? ['src/entities/**/*.ts'] : ['dist/entities/**/*.js'],
  migrations: isSyncDatabase ? ['src/migrations/**/*.ts'] : ['dist/migrations/**/*.js'],
  subscribers: []
};

export const AppDataSource = new DataSource(databaseConfig);
