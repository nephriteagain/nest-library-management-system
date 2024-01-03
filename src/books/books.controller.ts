import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Delete,
    Patch,
    Res,
    HttpStatus,
    UsePipes,
    Req
} from '@nestjs/common';
import { BooksService } from './books.service';
import type { BookArgs, BookSchemaType } from 'src/types/models';
import { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { bookArgsSchema, zodOIDValidator, partialBookArgsSchema } from 'src/types/models';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

@Controller('books')
export class BooksController {
    constructor(private bookService: BooksService) {}

    @Post('')
    @UsePipes(new ZodValidationPipe(bookArgsSchema))
    async addBook(@Body() book: BookArgs) : Promise<BookSchemaType> {
        const newBook = await this.bookService.add(book);
        return newBook;
    }

    @Delete(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async deleteBook(@Param('id') id: ObjectId, @Res() res: Response) : Promise<Response<200|404>> {
        const deleteStatus = await this.bookService.delete(id);
        if (deleteStatus) {
            return res.sendStatus(HttpStatus.OK);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Patch(':id')    
    async updateBook(
        @Body(new ZodValidationPipe(partialBookArgsSchema)) update: Partial<BookArgs>,
        @Param('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
        @Res() res: Response,
    ) : Promise<Response<BookSchemaType|404>> {        
        console.log(update)
        const updatedBook = await this.bookService.update(id, update);        
        if (updatedBook) {
            return res.send(updatedBook);
        }
        return res.status(HttpStatus.NOT_FOUND);
    }
    
    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getBook(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BookSchemaType | 404>> {
        console.log({id})
        const book = await this.bookService.getBook(id);
        if (book) {
            return res.send(book);
        }
        return res.status(HttpStatus.NOT_FOUND);
    }

    @UseGuards(AuthGuard)
    @Get('')
    async getBooks() : Promise<BookSchemaType[]> {
        const books = await this.bookService.getBooks()
        return books
    }
}
