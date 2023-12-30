import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { BooksModule } from './books/books.module';
import { MembersModule } from './members/members.module';
import { BorrowModule } from './borrow/borrow.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [DatabaseModule, BooksModule, MembersModule, BorrowModule, InventoryModule, ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
