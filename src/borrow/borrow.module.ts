import { Module } from '@nestjs/common';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
    controllers: [BorrowController],
    providers: [BorrowService, AuthGuard],
})
export class BorrowModule {}
