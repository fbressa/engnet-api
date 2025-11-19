/* eslint-disable */
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do responsável é obrigatório' })
  contactPerson: string;

  @IsString()
  @IsOptional() // CNPJ é opcional
  @Length(14, 18) // Aceita formato 00.000.000/0000-00 ou apenas números
  cnpj?: string;
}