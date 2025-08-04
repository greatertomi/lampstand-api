import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1754305787140 implements MigrationInterface {
    name = 'NewMigration1754305787140'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("reading_goal", "timezone");
    if (!hasColumn) {
      await queryRunner.query(`ALTER TABLE "reading_goal" ADD "timezone" character varying`);
      await queryRunner.query(`UPDATE "reading_goal" SET "timezone" = 'UTC' WHERE "timezone" IS NULL`);
      await queryRunner.query(`ALTER TABLE "reading_goal" ALTER COLUMN "timezone" SET NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("reading_goal", "timezone")) {
      await queryRunner.query(`ALTER TABLE "reading_goal" DROP COLUMN "timezone"`);
    }}

}
