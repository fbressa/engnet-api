import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {AuthController} from "../../../controllers/auth.controllers";
import {AuthServiceImplemantation} from "../../../application/auth/auth.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../../../entity/user/user.entity";
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            global: true,
            secret: 'segredo',
            signOptions: { expiresIn: '1000s' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthServiceImplemantation, JwtAuthGuard],
})
export class AuthModule {}
