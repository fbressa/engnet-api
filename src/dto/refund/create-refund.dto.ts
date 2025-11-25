/* eslint-disable */
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor deve ser um número válido' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  amount: number;

  @IsString()
  @IsUUID(undefined, { message: 'ID do usuário inválido' })
  userId: string;
}