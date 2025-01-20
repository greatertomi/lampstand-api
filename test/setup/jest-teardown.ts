import { removePostgresContainer } from './docker';

export default async () => {
  await removePostgresContainer();
};
