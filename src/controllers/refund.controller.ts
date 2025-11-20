/* eslint-disable */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { RefundService } from '../service/refund/refund.service';
import { CreateRefundDto } from '../dto/refund/create-refund.dto';

@Controller('refunds') // Define que a rota será http://localhost:3000/refunds
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  create(@Body() createRefundDto: CreateRefundDto) {
    return this.refundService.create(createRefundDto);
  }

  @Get()
  findAll() {
    return this.refundService.findAll();
  }
}