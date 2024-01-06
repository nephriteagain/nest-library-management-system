import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { envConstants } from './constants';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            secret: `${envConstants.secret}`,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    exports: [AuthService],
})
export class AuthModule {}
