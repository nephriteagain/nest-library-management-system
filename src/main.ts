import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger.middleware';

import { envConstants } from './auth/constants';
import * as cookieParser from 'cookie-parser';
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

const cors = envConstants.env === 'dev' ? 'http://localhost:5173' : false;
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: cors,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    });
    app.use(logger);
    app.useGlobalGuards(new AuthGuard(new JwtService()));
    await app.listen(3000);
}
bootstrap();
