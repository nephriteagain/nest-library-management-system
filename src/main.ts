import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger.middleware';

import { envConstants } from './auth/constants';
import * as cookieParser from 'cookie-parser'
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';


const cors = envConstants.env === 'dev' ? true : false;
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors });
    app.use(logger);
    app.use(cookieParser())
    app.useGlobalGuards(new AuthGuard(new JwtService()))
    await app.listen(3000);
}
bootstrap();
