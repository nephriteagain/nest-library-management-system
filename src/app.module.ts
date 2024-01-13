import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { BooksModule } from './books/books.module';
import { MembersModule } from './members/members.module';
import { BorrowModule } from './borrow/borrow.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ReturnModule } from './return/return.module';
import { PenaltyModule } from './penalty/penalty.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        DatabaseModule,
        BooksModule,
        MembersModule,
        BorrowModule,
        InventoryModule,
        AuthModule,
        UsersModule,
        ReturnModule,
        PenaltyModule,
        ConfigModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'clientBuild'),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
