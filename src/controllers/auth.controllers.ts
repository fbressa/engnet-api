import { Body, Controller, HttpCode, HttpStatus, Post, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import {AuthServiceImplemantation} from "../application/auth/auth.service";
import {LogindDto} from "../application/auth/dto/LogindDto";
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthServiceImplemantation) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Fazer login',
    description: 'Autentica um usuário e retorna um token JWT'
  })
  @ApiBody({
    description: 'Credenciais do usuário',
    type: LogindDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Email ou senha inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não encontrado',
  })
  async login(@Body() user: LogindDto) {
    return await this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter dados do usuário autenticado',
    description: 'Retorna os dados do usuário que está fazendo a requisição'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  getMe(@Req() req: any) {
    return req.user;
  }
}

