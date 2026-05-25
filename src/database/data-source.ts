import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Machine } from '../machine/entities/machine.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Company, User, Machine],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});