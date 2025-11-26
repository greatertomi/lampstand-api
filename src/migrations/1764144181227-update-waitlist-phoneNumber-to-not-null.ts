import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1764144181227 implements MigrationInterface {
    name = 'NewMigration1764144181227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_waitlist" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_waitlist" ALTER COLUMN "email" SET NOT NULL`);
    }

}
