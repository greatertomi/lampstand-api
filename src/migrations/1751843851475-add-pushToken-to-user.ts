import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1751843851475 implements MigrationInterface {
    name = 'NewMigration1751843851475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "expoPushToken" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "expoPushToken"`);
    }

}
