import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './logger.middleware';

import { envConstants } from './auth/constants'

const cors = envConstants.env === 'dev' ? true : false
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors });
    app.use(logger);
    await app.listen(3000);
}
bootstrap();
