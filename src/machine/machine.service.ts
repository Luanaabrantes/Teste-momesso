import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import type { AuthUser } from '../auth/types/auth-user.type';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private readonly machineRepository: Repository<Machine>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const machine = this.machineRepository.create(createMachineDto);

    return this.machineRepository.save(machine);
  }

  async findAll(authUser: AuthUser): Promise<Machine[]> {
    if (authUser.role === 'ADMIN') {
      return this.machineRepository.find({
        relations: {
          company: true,
        },
      });
    }

    return this.machineRepository.find({
      where: {
        companyId: authUser.companyId,
      },
      relations: {
        company: true,
      },
    });
  }

  async findOne(id: string, authUser?: AuthUser): Promise<Machine> {
    const machine = await this.machineRepository.findOne({
      where: { id },
      relations: {
        company: true,
      },
    });

    if (!machine) {
      throw new NotFoundException('Máquina não encontrada');
    }

    if (
      authUser &&
      authUser.role === 'USER' &&
      machine.companyId !== authUser.companyId
    ) {
      throw new NotFoundException('Máquina não encontrada');
    }

    return machine;
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
  ): Promise<Machine> {
    const machine = await this.findOne(id);

    Object.assign(machine, updateMachineDto);

    return this.machineRepository.save(machine);
  }

  async remove(id: string): Promise<void> {
    const machine = await this.findOne(id);

    await this.machineRepository.remove(machine);
  }
}