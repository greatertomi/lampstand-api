import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1754305787140 implements MigrationInterface {
    name = 'NewMigration1754305787140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reading_goal" ADD "timezone" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reading_goal" DROP COLUMN "timezone"`);
    }

}
