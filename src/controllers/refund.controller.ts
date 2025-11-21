/* eslint-disable */
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { RefundService } from '../service/refund/refund.service';
import { CreateRefundDto } from '../dto/refund/create-refund.dto';
import { UpdateRefundDto } from '../dto/refund/update-refund.dto';
import { RefundResponseDto } from '../dto/refund/refund-response.dto';

@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRefundDto: CreateRefundDto): Promise<RefundResponseDto> {
    const refund = await this.refundService.create(createRefundDto);
    return this.mapToResponseDto(refund);
  }

  @Get()
  async findAll(): Promise<RefundResponseDto[]> {
    const refunds = await this.refundService.findAll();
    return refunds.map(refund => this.mapToResponseDto(refund));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<RefundResponseDto> {
    const refund = await this.refundService.findById(id);
    if (!refund) {
      throw new NotFoundException(`Reembolso com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(refund);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<RefundResponseDto[]> {
    const refunds = await this.refundService.findByUserId(userId);
    return refunds.map(refund => this.mapToResponseDto(refund));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRefundDto: UpdateRefundDto,
  ): Promise<RefundResponseDto> {
    const refund = await this.refundService.update(id, updateRefundDto);
    return this.mapToResponseDto(refund);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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