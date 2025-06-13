import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749828715983 implements MigrationInterface {
    name = 'NewMigration1749828715983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."login_histories_logintype_enum" AS ENUM('Oauth', 'Password')`);
        await queryRunner.query(`CREATE TABLE "login_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "loginType" "public"."login_histories_logintype_enum" NOT NULL, "loginAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_96796022f2248dcb4ad106d4f30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."password_reset_tokens_status_enum" AS ENUM('active', 'expired', 'used')`);
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, "status" "public"."password_reset_tokens_status_enum" NOT NULL DEFAULT 'active', "userId" uuid, CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reading_goal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "goalInSeconds" integer NOT NULL, "reminderTime" TIME NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_860faaff3fbcc01e8079ef8e670" UNIQUE ("userId"), CONSTRAINT "PK_c9c48db03647a89e7455a8d23c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "phoneNumber" character varying, "agreedToTerms" boolean NOT NULL DEFAULT false, "profilePicture" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isOAuthUser" boolean NOT NULL DEFAULT false, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reading_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "userId" uuid, "bookId" uuid, CONSTRAINT "PK_12cee81735b8c71d8a92a82c87c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."books_format_enum" AS ENUM('pdf', 'epub', 'mobi')`);
        await queryRunner.query(`CREATE TABLE "books" ("id" uuid NOT NULL, "title" character varying NOT NULL, "author" character varying NOT NULL, "cover" text, "format" "public"."books_format_enum" NOT NULL, "size" integer NOT NULL, "url" character varying NOT NULL, "ownerId" uuid, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "login_histories" ADD CONSTRAINT "FK_7e542022a05be8c90a4d9fcbd8c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading_goal" ADD CONSTRAINT "FK_860faaff3fbcc01e8079ef8e670" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading_logs" ADD CONSTRAINT "FK_67f8eb08260d81da4a6c523093e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reading_logs" ADD CONSTRAINT "FK_aa571c6a6bb29454d04fec99903" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_82209aa3c485bb7f7e7e8374c66" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_82209aa3c485bb7f7e7e8374c66"`);
        await queryRunner.query(`ALTER TABLE "reading_logs" DROP CONSTRAINT "FK_aa571c6a6bb29454d04fec99903"`);
        await queryRunner.query(`ALTER TABLE "reading_logs" DROP CONSTRAINT "FK_67f8eb08260d81da4a6c523093e"`);
        await queryRunner.query(`ALTER TABLE "reading_goal" DROP CONSTRAINT "FK_860faaff3fbcc01e8079ef8e670"`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"`);
        await queryRunner.query(`ALTER TABLE "login_histories" DROP CONSTRAINT "FK_7e542022a05be8c90a4d9fcbd8c"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TYPE "public"."books_format_enum"`);
        await queryRunner.query(`DROP TABLE "reading_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "reading_goal"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."password_reset_tokens_status_enum"`);
        await queryRunner.query(`DROP TABLE "login_histories"`);
        await queryRunner.query(`DROP TYPE "public"."login_histories_logintype_enum"`);
    }

}
