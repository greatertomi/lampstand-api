
import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1764053507834 implements MigrationInterface {
  name = 'NewMigration1764053507834'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if user_push_tokens table exists before creating it
    const hasTable = await queryRunner.hasTable("user_push_tokens");
    if (!hasTable) {
      await queryRunner.query(`CREATE TABLE "user_push_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pushToken" character varying NOT NULL, "platform" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_8c8f0464a60f972981a76fe0ef5" PRIMARY KEY ("id"))`);
      await queryRunner.query(`ALTER TABLE "user_push_tokens" ADD CONSTRAINT "FK_784424a9b6c66123a055ea09172" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    await queryRunner.query(`ALTER TABLE "email_waitlist" ADD "phoneNumber" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "email_waitlist" ADD CONSTRAINT "UQ_fdb3a7b958476f6073669d00be8" UNIQUE ("phoneNumber")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("user_push_tokens");
    if (hasTable) {
      await queryRunner.query(`ALTER TABLE "user_push_tokens" DROP CONSTRAINT "FK_784424a9b6c66123a055ea09172"`);
      await queryRunner.query(`DROP TABLE "user_push_tokens"`);
    }

    await queryRunner.query(`ALTER TABLE "email_waitlist" DROP CONSTRAINT "UQ_fdb3a7b958476f6073669d00be8"`);
    await queryRunner.query(`ALTER TABLE "email_waitlist" DROP COLUMN "phoneNumber"`);
  }

}
