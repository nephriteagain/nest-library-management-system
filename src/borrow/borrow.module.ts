import { Module } from '@nestjs/common';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [BorrowController],
    providers: [BorrowService, AuthGuard, AuthService],
    imports: [UsersModule]
})
export class BorrowModule {}
