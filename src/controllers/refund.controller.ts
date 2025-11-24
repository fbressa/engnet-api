/* eslint-disable */
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RefundService } from '../service/refund/refund.service';
import { CreateRefundDto } from '../dto/refund/create-refund.dto';
import { UpdateRefundDto } from '../dto/refund/update-refund.dto';
import { RefundResponseDto } from '../dto/refund/refund-response.dto';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo reembolso',
    description: 'Cria um novo reembolso no sistema'
  })
  @ApiBody({
    type: CreateRefundDto,
    description: 'Dados do reembolso'
  })
  @ApiResponse({
    status: 201,
    description: 'Reembolso criado com sucesso',
    type: RefundResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  async create(@Body() createRefundDto: CreateRefundDto): Promise<RefundResponseDto> {
    const refund = await this.refundService.create(createRefundDto);
    return this.mapToResponseDto(refund);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os reembolsos',
    description: 'Retorna uma lista de todos os reembolsos cadastrados'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos',
    type: [RefundResponseDto]
  })
  async findAll(): Promise<RefundResponseDto[]> {
    const refunds = await this.refundService.findAll();
    return refunds.map(refund => this.mapToResponseDto(refund));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter reembolso por ID',
    description: 'Retorna os detalhes de um reembolso específico'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do reembolso',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Reembolso encontrado',
    type: RefundResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Reembolso não encontrado'
  })
  async findById(@Param('id') id: string): Promise<RefundResponseDto> {
    const refund = await this.refundService.findById(id);
    if (!refund) {
      throw new NotFoundException(`Reembolso com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(refund);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Listar reembolsos por usuário',
    description: 'Retorna todos os reembolsos de um usuário específico'
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'UUID do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos do usuário',
    type: [RefundResponseDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  async findByUserId(@Param('userId') userId: string): Promise<RefundResponseDto[]> {
    const refunds = await this.refundService.findByUserId(userId);
    return refunds.map(refund => this.mapToResponseDto(refund));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar reembolso',
    description: 'Atualiza os dados de um reembolso existente'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do reembolso'
  })
  @ApiBody({
    type: UpdateRefundDto,
    description: 'Dados a atualizar'
  })
  @ApiResponse({
    status: 200,
    description: 'Reembolso atualizado com sucesso',
    type: RefundResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Reembolso não encontrado'
  })
  async update(
    @Param('id') id: string,
    @Body() updateRefundDto: UpdateRefundDto,
  ): Promise<RefundResponseDto> {
    const refund = await this.refundService.update(id, updateRefundDto);
    return this.mapToResponseDto(refund);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar reembolso',
    description: 'Remove um reembolso do sistema'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do reembolso'
  })
  @ApiResponse({
    status: 204,
    description: 'Reembolso deletado com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Reembolso não encontrado'
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.refundService.delete(id);
  }

  private mapToResponseDto(refund: any): RefundResponseDto {
    const dto = new RefundResponseDto();
    dto.id = refund.id;
    dto.description = refund.description;
    dto.amount = refund.amount;
    dto.status = refund.status;
    dto.userId = refund.userId;
    dto.createdAt = refund.createdAt;
    dto.updatedAt = refund.updatedAt;
    return dto;
  }
}