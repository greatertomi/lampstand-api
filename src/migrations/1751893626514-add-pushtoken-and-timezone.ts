import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1751893626514 implements MigrationInterface {
  name = 'NewMigration1751893626514'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "expoPushToken" character varying`);
    await queryRunner.query(`UPDATE "users" SET "expoPushToken" = '' WHERE "expoPushToken" IS NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "expoPushToken" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "reading_goal" ADD "timezone" character varying`);
    await queryRunner.query(`UPDATE "reading_goal" SET "timezone" = 'UTC' WHERE "timezone" IS NULL`);
    await queryRunner.query(`ALTER TABLE "reading_goal" ALTER COLUMN "timezone" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reading_goal" DROP COLUMN "timezone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "expoPushToken"`);
  }
}
