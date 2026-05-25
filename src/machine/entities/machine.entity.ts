import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('machine')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  serialNumber!: string;

  @Column()
  companyId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Company, (company) => company.machines)
  company!: Company;
}