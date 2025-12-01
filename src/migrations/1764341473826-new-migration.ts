import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1764341473826 implements MigrationInterface {
    name = 'NewMigration1764341473826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_push_tokens" ADD CONSTRAINT "UQ_b3e5f10fa027101ecfcfe2dc0c7" UNIQUE ("pushToken")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_push_tokens" DROP CONSTRAINT "UQ_b3e5f10fa027101ecfcfe2dc0c7"`);
    }

}
