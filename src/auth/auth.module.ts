import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

import * as dotenv from 'dotenv'
dotenv.config()

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            secret: `${process.env.SECRET_KEY}`,
            signOptions: { expiresIn: '7d' },
        }),
    ],
})
export class AuthModule {}
