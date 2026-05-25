import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthUser } from '../auth/types/auth-user.type';

type DatabaseError = {
  code?: string;
};

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const company = this.companyRepository.create(createCompanyDto);

      return await this.companyRepository.save(company);
    } catch (error: unknown) {
      const databaseError = error as DatabaseError;

      if (databaseError.code === '23505') {
        throw new ConflictException('CNPJ já cadastrado');
      }

      throw error;
    }
  }

  async findAll(authUser: AuthUser): Promise<Company[]> {
    if (authUser.role === 'ADMIN') {
      return this.companyRepository.find();
    }

    return this.companyRepository.find({
      where: {
        id: authUser.companyId,
      },
    });
  }

  async findOne(id: string, authUser?: AuthUser): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (
      authUser &&
      authUser.role === 'USER' &&
      company.id !== authUser.companyId
    ) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);

    Object.assign(company, updateCompanyDto);

    try {
      return await this.companyRepository.save(company);
    } catch (error: unknown) {
      const databaseError = error as DatabaseError;

      if (databaseError.code === '23505') {
        throw new ConflictException('CNPJ já cadastrado');
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);

    await this.companyRepository.remove(company);
  }
}