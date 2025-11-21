/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity } from '../../entity/refund/refund.entity';
import { CreateRefundDto } from '../../dto/refund/create-refund.dto';
import { UpdateRefundDto } from '../../dto/refund/update-refund.dto';
import { UserEntity } from '../../entity/user/user.entity';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly refundRepository: Repository<RefundEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createRefundDto: CreateRefundDto): Promise<RefundEntity> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ 
      where: { id: createRefundDto.userId } 
    });
    
    if (!user) {
      throw new BadRequestException(`Usuário com ID ${createRefundDto.userId} não encontrado`);
    }

    const newRefund = this.refundRepository.create({
      ...createRefundDto,
      user,
    });
    
    return await this.refundRepository.save(newRefund);
  }

  async findAll(): Promise<RefundEntity[]> {
    return await this.refundRepository.find({ relations: ['user'] });
  }

  async findById(id: string): Promise<RefundEntity> {
    return await this.refundRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefundEntity[]> {
    return await this.refundRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async update(id: string, updateRefundDto: UpdateRefundDto): Promise<RefundEntity> {
    const refund = await this.refundRepository.findOne({ where: { id } });
    
    if (!refund) {
      throw new NotFoundException(`Reembolso com ID ${id} não encontrado`);
    }

    if (updateRefundDto.description !== undefined) {
      refund.description = updateRefundDto.description;
    }
    if (updateRefundDto.amount !== undefined) {
      refund.amount = updateRefundDto.amount;
    }
    if (updateRefundDto.status !== undefined) {
      refund.status = updateRefundDto.status;
    }

    return await this.refundRepository.save(refund);
  }

  async delete(id: string): Promise<void> {
    const refund = await this.refundRepository.findOne({ where: { id } });
    
    if (!refund) {
      throw new NotFoundException(`Reembolso com ID ${id} não encontrado`);
    }

    await this.refundRepository.delete(id);
  }
}