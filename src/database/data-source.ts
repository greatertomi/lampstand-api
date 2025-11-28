import { DataSource, DataSourceOptions } from 'typeorm';
import envConfig from '../config/envConfig';

const isProduction = envConfig.NODE_ENV === 'production';

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: envConfig.POSTGRES_HOST,
  port: envConfig.POSTGRES_PORT,
  username: envConfig.POSTGRES_USER,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_DB,
  synchronize: false,
  logging: false,
  entities: isProduction ? ['dist/entities/**/*.js'] : ['src/entities/**/*.ts'],
  migrations: isProduction ? ['dist/migrations/**/*.js'] : ['src/migrations/**/*.ts'],
  subscribers: [],
  ...(isProduction && { ssl: { rejectUnauthorized: false } })
};

export const AppDataSource = new DataSource(databaseConfig);
