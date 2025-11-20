/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../entity/client/client.entity';
import { CreateClientDto } from '../../dto/client/create-client.dto';

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
}