import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total de reembolsos solicitados' })
  totalRefunds: number;

  @ApiProperty({ description: 'Valor total dos reembolsos' })
  totalRefundValue: number;

  @ApiProperty({ description: 'Total de clientes cadastrados' })
  totalClients: number;

  @ApiProperty({ description: 'Reembolsos aprovados' })
  approvedRefunds: number;

  @ApiProperty({ description: 'Reembolsos rejeitados' })
  rejectedRefunds: number;

  @ApiProperty({ description: 'Reembolsos pendentes' })
  pendingRefunds: number;
}
