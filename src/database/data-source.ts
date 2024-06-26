import { DataSource, DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import envConfig from '../config/envConfig';

const syncDatabase = envConfig.SYNC_DATABASE;

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: envConfig.POSTGRES_HOST,
  port: envConfig.POSTGRES_PORT,
  username: envConfig.POSTGRES_USER,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_DB,
  synchronize: syncDatabase,
  logging: false,
  entities: syncDatabase ? ['src/entities/**/*.ts'] : ['dist/entities/**/*.js'],
  migrations: syncDatabase ? ['src/migrations/**/*.ts'] : ['dist/migrations/**/*.js'],
  subscribers: []
};

export const AppDataSource = new DataSource(databaseConfig);

// export default AppDataSource;
