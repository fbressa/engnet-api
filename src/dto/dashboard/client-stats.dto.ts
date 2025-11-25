/* eslint-disable */
export class ClientStatsDto {
  totalClients: number;
  totalWithRefunds: number;
  totalWithoutRefunds: number;
  closedContracts: number; // Clientes com CNPJ (considerados contratos fechados)
}
