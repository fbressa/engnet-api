/* eslint-disable */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ClientService } from '../service/client/client.service';
import { CreateClientDto } from '../dto/client/create-client.dto';

@Controller('clients') // Rota será http://localhost:3000/clients
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }
}