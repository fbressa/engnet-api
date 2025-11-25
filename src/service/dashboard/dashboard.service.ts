/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity, RefundStatus } from '../../entity/refund/refund.entity';
import { UserEntity } from '../../entity/user/user.entity';
import { ClientEntity } from '../../entity/client/client.entity';
import { DashboardSummaryDto } from '../../dto/dashboard/dashboard-summary.dto';
import { RefundStatsDto } from '../../dto/dashboard/refund-stats.dto';
import { UserStatsDto } from '../../dto/dashboard/user-stats.dto';
import { ClientStatsDto } from '../../dto/dashboard/client-stats.dto';
import { RefundReportDto } from '../../dto/dashboard/refund-report.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly refundRepository: Repository<RefundEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    const refundStats = await this.getRefundStats();
    const userStats = await this.getUserStats();
    const clientStats = await this.getClientStats();

    return {
      refunds: refundStats,
      users: userStats,
      clients: clientStats,
      generatedAt: new Date(),
    };
  }

  private async getRefundStats(): Promise<RefundStatsDto> {
    const allRefunds = await this.refundRepository.find();
    
    const totalRefunds = allRefunds.length;
    const totalAmount = allRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
    
    const byStatus = {
      pending: allRefunds.filter(r => r.status === RefundStatus.PENDING).length,
      approved: allRefunds.filter(r => r.status === RefundStatus.APPROVED).length,
      rejected: allRefunds.filter(r => r.status === RefundStatus.REJECTED).length,
    };

    const averageAmount = totalRefunds > 0 ? totalAmount / totalRefunds : 0;

    return {
      totalRefunds,
      totalAmount: Number(totalAmount.toFixed(2)),
      byStatus,
      averageAmount: Number(averageAmount.toFixed(2)),
    };
  }

  private async getUserStats(): Promise<UserStatsDto> {
    const totalUsers = await this.userRepository.count();
    
    // Usuários que têm pelo menos um reembolso
    const usersWithRefunds = await this.refundRepository
      .createQueryBuilder('refund')
      .select('DISTINCT refund.userId')
      .getRawMany();
    
    const activeUsers = usersWithRefunds.length;
    const usersWithoutRefunds = totalUsers - activeUsers;

    return {
      totalUsers,
      activeUsers,
      usersWithoutRefunds,
    };
  }

  private async getClientStats(): Promise<ClientStatsDto> {
    const totalClients = await this.clientRepository.count();
    
    // Contar clientes com CNPJ (contratos fechados)
    const closedContracts = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.cnpj IS NOT NULL')
      .andWhere("client.cnpj != ''")
      .getCount();
    
    // Para agora, consideramos todos como sem reembolsos diretos
    // Pois a relação de Client -> Refund não está implementada na entidade
    return {
      totalClients,
      totalWithRefunds: 0,
      totalWithoutRefunds: totalClients,
      closedContracts,
    };
  }

  async getRefundReport(status?: RefundStatus): Promise<RefundReportDto[]> {
    let query = this.refundRepository.createQueryBuilder('refund');

    if (status) {
      query = query.where('refund.status = :status', { status });
    }

    const refunds = await query.orderBy('refund.createdAt', 'DESC').getMany();

    return refunds.map(refund => this.mapRefundToReport(refund));
  }

  private mapRefundToReport(refund: RefundEntity): RefundReportDto {
    const now = new Date();
    const createdAt = new Date(refund.createdAt);
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      id: refund.id,
      description: refund.description,
      amount: Number(refund.amount),
      status: refund.status,
      userId: refund.userId,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt,
      daysSinceCreation,
    };
  }

  async getRefundsByStatus(status: RefundStatus): Promise<RefundReportDto[]> {
    const refunds = await this.refundRepository.find({ where: { status } });
    return refunds.map(refund => this.mapRefundToReport(refund));
  }

  async getRefundsByUser(userId: string): Promise<RefundReportDto[]> {
    const refunds = await this.refundRepository.find({ where: { userId } });
    return refunds.map(refund => this.mapRefundToReport(refund));
  }

  async getRefundsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RefundReportDto[]> {
    const refunds = await this.refundRepository
      .createQueryBuilder('refund')
      .where('refund.createdAt >= :startDate', { startDate })
      .andWhere('refund.createdAt <= :endDate', { endDate })
      .orderBy('refund.createdAt', 'DESC')
      .getMany();

    return refunds.map(refund => this.mapRefundToReport(refund));
  }
}
