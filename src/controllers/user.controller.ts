/* eslint-disable */
import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, ConflictException, ClassSerializerInterceptor, UseInterceptors, Put, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from '../service/user/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserResponseDto } from '../dto/user/user-response.dto';
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map(user => this.mapToResponseDto(user));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return this.mapToResponseDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
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
