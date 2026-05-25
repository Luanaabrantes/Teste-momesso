import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRlsPolicies1770000000000 implements MigrationInterface {
  name = 'AddRlsPolicies1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE company ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE machine ENABLE ROW LEVEL SECURITY;
    `);

    await queryRunner.query(`
      DROP POLICY IF EXISTS company_admin_all ON company;
      DROP POLICY IF EXISTS company_user_own_company ON company;

      CREATE POLICY company_admin_all
      ON company
      FOR ALL
      USING (current_setting('app.current_user_role', true) = 'ADMIN')
      WITH CHECK (current_setting('app.current_user_role', true) = 'ADMIN');

      CREATE POLICY company_user_own_company
      ON company
      FOR SELECT
      USING (
        id::text = current_setting('app.current_company_id', true)
      );
    `);

    await queryRunner.query(`
      DROP POLICY IF EXISTS user_admin_all ON "user";
      DROP POLICY IF EXISTS user_user_own_company_select ON "user";

      CREATE POLICY user_admin_all
      ON "user"
      FOR ALL
      USING (current_setting('app.current_user_role', true) = 'ADMIN')
      WITH CHECK (current_setting('app.current_user_role', true) = 'ADMIN');

      CREATE POLICY user_user_own_company_select
      ON "user"
      FOR SELECT
      USING (
        "companyId"::text = current_setting('app.current_company_id', true)
      );
    `);

    await queryRunner.query(`
      DROP POLICY IF EXISTS machine_admin_all ON machine;
      DROP POLICY IF EXISTS machine_user_own_company_select ON machine;

      CREATE POLICY machine_admin_all
      ON machine
      FOR ALL
      USING (current_setting('app.current_user_role', true) = 'ADMIN')
      WITH CHECK (current_setting('app.current_user_role', true) = 'ADMIN');

      CREATE POLICY machine_user_own_company_select
      ON machine
      FOR SELECT
      USING (
        "companyId"::text = current_setting('app.current_company_id', true)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP POLICY IF EXISTS company_admin_all ON company;
      DROP POLICY IF EXISTS company_user_own_company ON company;

      DROP POLICY IF EXISTS user_admin_all ON "user";
      DROP POLICY IF EXISTS user_user_own_company_select ON "user";

      DROP POLICY IF EXISTS machine_admin_all ON machine;
      DROP POLICY IF EXISTS machine_user_own_company_select ON machine;
    `);

    await queryRunner.query(`
      ALTER TABLE company DISABLE ROW LEVEL SECURITY;
      ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
      ALTER TABLE machine DISABLE ROW LEVEL SECURITY;
    `);
  }
}

