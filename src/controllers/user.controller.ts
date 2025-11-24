/* eslint-disable */
import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, ConflictException, ClassSerializerInterceptor, UseInterceptors, Put, Delete, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../service/user/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserResponseDto } from '../dto/user/user-response.dto';
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Registra um novo usuário no sistema'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados do usuário'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado'
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Verificar se email já existe
      const existingUser = await this.userService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }
      const user = await this.userService.create(createUserDto);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '23505') { // Erro de unique constraint do PostgreSQL
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista de todos os usuários cadastrados'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    type: [UserResponseDto]
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map(user => this.mapToResponseDto(user));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna os dados de um usuário específico'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do usuário'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Dados a atualizar'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado'
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do usuário'
  })
  @ApiResponse({
    status: 204,
    description: 'Usuário deletado com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  private mapToResponseDto(user: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}