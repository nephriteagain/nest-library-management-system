import { Module } from '@nestjs/common';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';

@Module({
    controllers: [BorrowController],
    providers: [BorrowService, AuthService],
    imports: [UsersModule],
})
export class BorrowModule {}
