import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";


@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: 'JWT_SECRET',
            signOptions: { expiresIn: '1000s' },
        }),
    ],
    controllers: [],
    providers: [],
})
export class AuthModule {}
