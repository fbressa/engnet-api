/* eslint-disable */
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ClientService } from '../service/client/client.service';
import { CreateClientDto } from '../dto/client/create-client.dto';
import { UpdateClientDto } from '../dto/client/update-client.dto';
import { ClientResponseDto } from '../dto/client/client-response.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientService.create(createClientDto);
    return this.mapToResponseDto(client);
  }

  @Get()
  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientService.findAll();
    return clients.map(client => this.mapToResponseDto(client));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.clientService.findById(id);
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(client);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientService.update(id, updateClientDto);
    return this.mapToResponseDto(client);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.clientService.delete(id);
  }

  private mapToResponseDto(client: any): ClientResponseDto {
    const dto = new ClientResponseDto();
    dto.id = client.id;
    dto.companyName = client.companyName;
    dto.cnpj = client.cnpj;
    dto.contactPerson = client.contactPerson;
    dto.createdAt = client.createdAt;
    dto.updatedAt = client.updatedAt;
    return dto;
  }
}