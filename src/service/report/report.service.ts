import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workbook } from 'exceljs';
import { RefundEntity, RefundStatus } from '../../entity/refund/refund.entity';
import { UserEntity } from '../../entity/user/user.entity';
import { ClientEntity } from '../../entity/client/client.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(RefundEntity)
    private refundRepository: Repository<RefundEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
  ) {}

  async generateRefundReport(
    status?: RefundStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Refunds');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Valor (R$)', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Usuário', key: 'userName', width: 20 },
        { header: 'Email', key: 'userEmail', width: 25 },
        { header: 'Data Criação', key: 'createdAt', width: 18 },
        { header: 'Data Atualização', key: 'updatedAt', width: 18 },
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };

      // Buscar dados
      let query = this.refundRepository
        .createQueryBuilder('refund')
        .leftJoinAndSelect('refund.user', 'user');

      if (status) {
        query = query.where('refund.status = :status', { status });
      }

      if (startDate) {
        query = query.andWhere('refund.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        query = query.andWhere('refund.createdAt <= :endDate', { endDate });
      }

      const refunds = await query.orderBy('refund.createdAt', 'DESC').getMany();

      // Adicionar dados
      refunds.forEach((refund) => {
        const amount = typeof refund.amount === 'string' ? parseFloat(refund.amount) : refund.amount;
        worksheet.addRow({
          id: refund.id,
          description: refund.description,
          amount: `R$ ${amount.toFixed(2)}`,
          status: refund.status,
          userName: refund.user?.name || 'N/A',
          userEmail: refund.user?.email || 'N/A',
          createdAt: refund.createdAt?.toLocaleDateString('pt-BR'),
          updatedAt: refund.updatedAt?.toLocaleDateString('pt-BR'),
        });
      });

      // Adicionar resumo
      const summaryRow = worksheet.addRow({});
      summaryRow.height = 20;

      const totalRow = worksheet.addRow({
        description: 'TOTAL',
        amount: `R$ ${refunds.reduce((sum, r) => {
          const amt = typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount;
          return sum + amt;
        }, 0).toFixed(2)}`,
      });
      totalRow.getCell(2).font = { bold: true };
      totalRow.getCell(3).font = { bold: true };
      totalRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCC' },
      };

      // Retornar buffer
      return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    } catch (error) {
      console.error('Erro ao gerar relatório de refunds:', error);
      throw error;
    }
  }

  async generateDetailedRefundReport(userId?: string): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Relatório Detalhado');

      // Título
      const titleRow = worksheet.addRow(['RELATÓRIO DETALHADO DE REEMBOLSOS']);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A1:H1');

      // Data de geração
      const dateRow = worksheet.addRow([`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`]);
      dateRow.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A2:H2');
      worksheet.addRow([]);

      // Cabeçalho
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Valor', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Usuário', key: 'userName', width: 20 },
        { header: 'Email', key: 'userEmail', width: 25 },
        { header: 'Criado em', key: 'createdAt', width: 18 },
        { header: 'Dias desde criação', key: 'daysSince', width: 18 },
      ];

      const headerRow = worksheet.getRow(4);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };

      // Buscar dados
      let query = this.refundRepository.createQueryBuilder('refund').leftJoinAndSelect('refund.user', 'user');

      if (userId) {
        query = query.where('refund.userId = :userId', { userId });
      }

      const refunds = await query.orderBy('refund.createdAt', 'DESC').getMany();

      // Adicionar dados
      refunds.forEach((refund) => {
        const amount = typeof refund.amount === 'string' ? parseFloat(refund.amount) : refund.amount;
        const daysSince = Math.floor((Date.now() - refund.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        worksheet.addRow({
          id: refund.id,
          description: refund.description,
          amount: `R$ ${amount.toFixed(2)}`,
          status: refund.status,
          userName: refund.user?.name || 'N/A',
          userEmail: refund.user?.email || 'N/A',
          createdAt: refund.createdAt?.toLocaleDateString('pt-BR'),
          daysSince: `${daysSince} dias`,
        });
      });

      // Estatísticas
      const statsRow = worksheet.addRow([]);
      worksheet.addRow(['ESTATÍSTICAS']);

      const totalAmount = refunds.reduce((sum, r) => {
        const amt = typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount;
        return sum + amt;
      }, 0);
      const pendingCount = refunds.filter((r) => r.status === RefundStatus.PENDING).length;
      const approvedCount = refunds.filter((r) => r.status === RefundStatus.APPROVED).length;
      const rejectedCount = refunds.filter((r) => r.status === RefundStatus.REJECTED).length;

      worksheet.addRow([`Total de Reembolsos: ${refunds.length}`]);
      worksheet.addRow([`Valor Total: R$ ${totalAmount.toFixed(2)}`]);
      worksheet.addRow([`Pendentes: ${pendingCount}`]);
      worksheet.addRow([`Aprovados: ${approvedCount}`]);
      worksheet.addRow([`Rejeitados: ${rejectedCount}`]);

      return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    } catch (error) {
      console.error('Erro ao gerar relatório detalhado:', error);
      throw error;
    }
  }

  async generateSummaryReport(): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Resumo');

      // Título
      const titleRow = worksheet.addRow(['RESUMO DO SISTEMA']);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A1:D1');

      worksheet.addRow([]);

      // Contar entidades
      const [totalUsers, totalClients, totalRefunds] = await Promise.all([
        this.userRepository.count(),
        this.clientRepository.count(),
        this.refundRepository.count(),
      ]);

      const refundsByStatus = await this.refundRepository
        .createQueryBuilder('refund')
        .select('refund.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('refund.status')
        .getRawMany();

      const totalRefundAmount = (
        await this.refundRepository
          .createQueryBuilder('refund')
          .select('SUM(refund.amount)', 'total')
          .getRawOne()
      ).total || 0;

      // Dados gerais
      worksheet.addRow(['DADOS GERAIS']);
      worksheet.addRow([]);
      worksheet.addRow(['Total de Usuários', totalUsers]);
      worksheet.addRow(['Total de Clientes', totalClients]);
      worksheet.addRow(['Total de Reembolsos', totalRefunds]);
      worksheet.addRow(['Valor Total em Reembolsos', `R$ ${parseFloat(totalRefundAmount).toFixed(2)}`]);

      worksheet.addRow([]);
      worksheet.addRow(['REEMBOLSOS POR STATUS']);
      worksheet.addRow([]);

      refundsByStatus.forEach((item) => {
        worksheet.addRow([item.status, item.count]);
      });

      worksheet.addRow([]);
      worksheet.addRow([`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`]);

      return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    } catch (error) {
      console.error('Erro ao gerar relatório de resumo:', error);
      throw error;
    }
  }
}
