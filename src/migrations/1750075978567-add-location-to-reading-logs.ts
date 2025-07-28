import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1750075978567 implements MigrationInterface {
  name = 'NewMigration1750075978567'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns as nullable first
    await queryRunner.query(`ALTER TABLE "reading_logs" ADD "startLocation" json`);
    await queryRunner.query(`ALTER TABLE "reading_logs" ADD "endLocation" json`);

    // Update existing rows with default values
    await queryRunner.query(`UPDATE "reading_logs" SET "startLocation" = '{}' WHERE "startLocation" IS NULL`);
    await queryRunner.query(`UPDATE "reading_logs" SET "endLocation" = '{}' WHERE "endLocation" IS NULL`);

    // Now make them NOT NULL
    await queryRunner.query(`ALTER TABLE "reading_logs" ALTER COLUMN "startLocation" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "reading_logs" ALTER COLUMN "endLocation" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reading_logs" DROP COLUMN "endLocation"`);
    await queryRunner.query(`ALTER TABLE "reading_logs" DROP COLUMN "startLocation"`);
  }
}
