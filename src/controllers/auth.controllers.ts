import { Body, Controller, HttpCode, HttpStatus, Post, Get, Req, UseGuards } from '@nestjs/common';
import {AuthServiceImplemantation} from "../application/auth/auth.service";
import {LogindDto} from "../application/auth/dto/LogindDto";
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthServiceImplemantation) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: LogindDto) {
    return await this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}
