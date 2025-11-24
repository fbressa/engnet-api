import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {Repository} from "typeorm";
import {UserEntity} from "../../entity/user/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {LogindDto} from "./dto/LogindDto";
import {LoginResponse, UserResponse} from "./response/LoginResponse";

@Injectable()
export class AuthServiceImplemantation  {

    constructor(
      @InjectRepository(UserEntity) private userRepository : Repository<UserEntity>,
      private jwtService: JwtService
    ) {}

    /**
     * Autentica um usuário e retorna JWT + dados do usuário
     * @param login - Credenciais (email, password)
     * @returns LoginResponse com access_token e user
     * @throws UnauthorizedException - Se credenciais inválidas
     * @throws BadRequestException - Se entrada inválida
     */
    async login(login: LogindDto): Promise<LoginResponse> {
        // Validação de entrada
        if (!login.email || !login.password) {
            throw new BadRequestException('Email e senha são obrigatórios');
        }

        // Buscar usuário no banco de dados
        const user = await this.userRepository.findOne({
            where : { email: login.email },
            select: ['id', 'name', 'email', 'password', 'role']
        });

        // Validar se usuário existe e tem senha
        if (!user || !user.password) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // Verificar senha com bcrypt
        const isPasswordValid = await bcrypt.compare(login.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // Gerar JWT
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const access_token = await this.jwtService.signAsync(payload);

        // Construir resposta com dados do usuário
        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };

        return {
            access_token,
            user: userResponse
        };
    }
}
