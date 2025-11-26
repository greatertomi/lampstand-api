import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1764157451849 implements MigrationInterface {
    name = 'NewMigration1764157451849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_waitlist" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_waitlist" ALTER COLUMN "phoneNumber" SET NOT NULL`);
    }

}
