import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class EnsureAdminUser1779572113537 implements MigrationInterface {
  name = 'EnsureAdminUser1779572113537';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      [
        '6ea63c17-3193-4564-9e89-ca2880a52514',
        'Momesso Tecnologia',
        '12345678000198',
      ],
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

  public async down(): Promise<void> {
    return;
  }
}
