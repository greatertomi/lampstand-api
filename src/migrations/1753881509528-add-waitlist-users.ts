import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1753881509528 implements MigrationInterface {
    name = 'NewMigration1753881509528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_waitlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "isVerified" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f30064890212ab6b22372ed0a23" UNIQUE ("email"), CONSTRAINT "PK_3eaa6ccfb8e9e8a62369324bcdd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "email_waitlist"`);
    }

}
