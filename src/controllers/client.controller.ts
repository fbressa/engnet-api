/* eslint-disable */
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ClientService } from '../service/client/client.service';
import { CreateClientDto } from '../dto/client/create-client.dto';
import { UpdateClientDto } from '../dto/client/update-client.dto';
import { ClientResponseDto } from '../dto/client/client-response.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Cria um novo cliente no sistema'
  })
  @ApiBody({
    type: CreateClientDto,
    description: 'Dados do cliente'
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientService.create(createClientDto);
    return this.mapToResponseDto(client);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description: 'Retorna uma lista de todos os clientes cadastrados'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes',
    type: [ClientResponseDto]
  })
  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientService.findAll();
    return clients.map(client => this.mapToResponseDto(client));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter cliente por ID',
    description: 'Retorna os detalhes de um cliente específico'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado'
  })
  async findById(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.clientService.findById(id);
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(client);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza os dados de um cliente existente'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do cliente'
  })
  @ApiBody({
    type: UpdateClientDto,
    description: 'Dados a atualizar'
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado'
  })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientService.update(id, updateClientDto);
    return this.mapToResponseDto(client);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar cliente',
    description: 'Remove um cliente do sistema'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do cliente'
  })
  @ApiResponse({
    status: 204,
    description: 'Cliente deletado com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado'
  })
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