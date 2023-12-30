import { Module } from '@nestjs/common';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';

@Module({
  controllers: [BorrowController],
  providers: [BorrowService]
})
export class BorrowModule {}
