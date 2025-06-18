import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1750075978567 implements MigrationInterface {
    name = 'NewMigration1750075978567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reading_logs" ADD "startLocation" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reading_logs" ADD "endLocation" json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reading_logs" DROP COLUMN "endLocation"`);
        await queryRunner.query(`ALTER TABLE "reading_logs" DROP COLUMN "startLocation"`);
    }

}
