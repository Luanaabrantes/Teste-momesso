import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateInitialTables1779572113535 implements MigrationInterface {
  name = 'CreateInitialTables1779572113535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'USER');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "cnpj" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_company_cnpj" UNIQUE ("cnpj"),
        CONSTRAINT "PK_company_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'USER',
        "companyId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "machine" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "serialNumber" character varying NOT NULL,
        "companyId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_machine_serialNumber" UNIQUE ("serialNumber"),
        CONSTRAINT "PK_machine_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_machine_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    const seedCompanyId = '6ea63c17-3193-4564-9e89-ca2880a52514';
    const adminPassword = await bcrypt.hash('123456', 10);

    const companies = await queryRunner.query(
      `
        INSERT INTO "company" ("id", "name", "cnpj")
        VALUES ($1, $2, $3)
        ON CONFLICT ("cnpj") DO UPDATE
        SET "name" = EXCLUDED."name",
            "cnpj" = EXCLUDED."cnpj"
        RETURNING "id"
      `,
      [seedCompanyId, 'Momesso Tecnologia', '12345678000198'],
    );
    const companyId = companies[0].id as string;

    await queryRunner.query(
      `
        INSERT INTO "user" ("name", "email", "password", "role", "companyId")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ("email") DO UPDATE
        SET "name" = EXCLUDED."name",
            "password" = EXCLUDED."password",
            "role" = EXCLUDED."role",
            "companyId" = EXCLUDED."companyId"
      `,
      [
        'Luana Admin',
        'luanab.admin@email.com',
        adminPassword,
        'ADMIN',
        companyId,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "machine"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
