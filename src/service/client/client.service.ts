/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../entity/client/client.entity';
import { CreateClientDto } from '../../dto/client/create-client.dto';
import { UpdateClientDto } from '../../dto/client/update-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<ClientEntity> {
    const newClient = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(newClient);
  }

  async findAll(): Promise<ClientEntity[]> {
    return await this.clientRepository.find();
  }

  async findById(id: string): Promise<ClientEntity> {
    return await this.clientRepository.findOne({ where: { id } });
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<ClientEntity> {
    const client = await this.clientRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    if (updateClientDto.companyName) {
      client.companyName = updateClientDto.companyName;
    }
    if (updateClientDto.contactPerson) {
      client.contactPerson = updateClientDto.contactPerson;
    }
    if (updateClientDto.cnpj !== undefined) {
      client.cnpj = updateClientDto.cnpj;
    }

    return await this.clientRepository.save(client);
  }

  async delete(id: string): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    await this.clientRepository.delete(id);
  }
}