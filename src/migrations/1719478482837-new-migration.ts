import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1719478482837 implements MigrationInterface {
  name = 'NewMigration1719478482837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "password_reset_tokens" DROP COLUMN "token"');
    await queryRunner.query('ALTER TABLE "password_reset_tokens" ADD "token" integer NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "password_reset_tokens" DROP COLUMN "token"');
    await queryRunner.query('ALTER TABLE "password_reset_tokens" ADD "token" bigint NOT NULL');
  }
}
