import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthService } from 'src/auth/auth.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    providers: [BooksService, AuthService, InventoryService],
    controllers: [BooksController],
    imports: [UsersModule],
})
export class BooksModule {}
