import { Module } from '@nestjs/common';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';

@Module({
    controllers: [ReturnController],
    providers: [ReturnService, AuthService],
    imports: [UsersModule],
})
export class ReturnModule {}
