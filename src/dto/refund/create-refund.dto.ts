/* eslint-disable */
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  amount: number;

  @IsUUID(undefined, { message: 'ID do usuário inválido' })
  userId: string;
}