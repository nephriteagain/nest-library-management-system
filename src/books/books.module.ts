import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthService } from '../auth/auth.service';
import { InventoryService } from '../inventory/inventory.service';
import { UsersModule } from '../users/users.module';
import bookSchema from '../db/schemas/book.schema';

@Module({
    providers: [
        AuthService, 
        InventoryService,
        {
            provide: BooksService,
            useValue: new BooksService(bookSchema),            
        }
    ],
    controllers: [BooksController],
    imports: [UsersModule],
})
export class BooksModule {}
