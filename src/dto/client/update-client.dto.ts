/* eslint-disable */
import { IsString, IsOptional, Length, ValidateIf } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsOptional()
  @ValidateIf((o) => o.cnpj && o.cnpj.length > 0) // Só valida se não estiver vazio
  @IsString()
  @Length(14, 18, { message: 'CNPJ deve ter entre 14 e 18 caracteres' })
  cnpj?: string;
}
