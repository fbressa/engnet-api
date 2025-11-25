/* eslint-disable */
import { IsString, IsNotEmpty, IsOptional, Length, ValidateIf } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do responsável é obrigatório' })
  contactPerson: string;

  @IsOptional()
  @ValidateIf((o) => o.cnpj && o.cnpj.length > 0) // Só valida se não estiver vazio
  @IsString()
  @Length(14, 18, { message: 'CNPJ deve ter entre 14 e 18 caracteres' })
  cnpj?: string;
}