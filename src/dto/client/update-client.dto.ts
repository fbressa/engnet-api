/* eslint-disable */
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  @Length(14, 18)
  cnpj?: string;
}
