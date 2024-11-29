import { EntityTarget, Repository } from 'typeorm';

import envConfig from '../config/envConfig';
import { AppDataSource, TestDataSource } from '../database';

const handleGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  const environment = envConfig.NODE_ENV || 'development';
  return environment === 'test'
    ? TestDataSource.manager.getRepository(entity)
    : AppDataSource.manager.getRepository(entity);
};

export default handleGetRepository;
