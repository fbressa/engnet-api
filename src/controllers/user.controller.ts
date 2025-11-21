/* eslint-disable */
import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, ConflictException, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { UserService } from '../service/user/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
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
    return user ? this.mapToResponseDto(user) : null;
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
