import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthUser } from '../auth/types/auth-user.type';

type DatabaseError = {
  code?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepository.save(user);
    } catch (error: unknown) {
      const databaseError = error as DatabaseError;

      if (databaseError.code === '23505') {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw error;
    }
  }

  async findAll(authUser: AuthUser): Promise<User[]> {
    if (authUser.role === 'ADMIN') {
      return this.userRepository.find({
        relations: {
          company: true,
        },
      });
    }

    return this.userRepository.find({
      where: {
        companyId: authUser.companyId,
      },
      relations: {
        company: true,
      },
    });
  }

  async findOne(id: string, authUser?: AuthUser): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (
      authUser &&
      authUser.role === 'USER' &&
      user.companyId !== authUser.companyId
    ) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
  return this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .leftJoinAndSelect('user.company', 'company')
    .where('user.email = :email', { email })
    .getOne();
}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    try {
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      const databaseError = error as DatabaseError;

      if (databaseError.code === '23505') {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }
}