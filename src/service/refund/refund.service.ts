/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity } from '../../entity/refund/refund.entity';
import { CreateRefundDto } from '../../dto/refund/create-refund.dto';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly refundRepository: Repository<RefundEntity>,
  ) {}

  async create(createRefundDto: CreateRefundDto): Promise<RefundEntity> {
    // 1. Cria o objeto reembolso com os dados do DTO
    const newRefund = this.refundRepository.create(createRefundDto);
    
    // 2. Salva no banco de dados
    return await this.refundRepository.save(newRefund);
  }

  async findAll(): Promise<RefundEntity[]> {
    return await this.refundRepository.find();
  }
}