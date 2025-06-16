import { DataSource, DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import envConfig from '../config/envConfig';

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: envConfig.POSTGRES_HOST,
  port: envConfig.POSTGRES_PORT,
  username: envConfig.POSTGRES_USER,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_DB,
  synchronize: false,
  logging: false,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: [],
  ...(envConfig.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } })
};

export const AppDataSource = new DataSource(databaseConfig);
