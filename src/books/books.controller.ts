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
    Req,
    Query,
    HttpException,
    ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import type { BookArgs, BookSchemaType } from 'src/types/models';
import { ObjectId } from 'mongoose';
import { Response } from 'express';
import {
    bookArgsSchema,
    zodOIDValidator,
    partialBookArgsSchema,
    zodOIDValidatorOptional,
} from 'src/types/models';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

@Controller('api/books')
export class BooksController {
    constructor(private bookService: BooksService) {}

    @Get('')
    async getBooks(
        @Query('title') title: string,
        @Query('authors') authors: string,
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id: ObjectId,
        @Query('yearPublished', new ParseIntPipe({ optional: true }))
        yearPublished?: number,
    ): Promise<BookSchemaType[]> {
        return await this.bookService.getBooks({
            title,
            authors,
            _id,
            yearPublished,
        });
    }

    /**
     * @param text : _id || title
     * @note works on eithere title or _id
     */
    @Get('search')
    async searchBooks(
        @Query('q') q: string,
    ): Promise<{ title: string; _id: ObjectId }[]> {
        console.log('u hit this endpoint');
        const bookQuery = await this.bookService.search(q);
        return bookQuery;
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof BookSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: BookSchemaType[keyof BookSchemaType] }> {
        const book = await this.bookService.getBook(_id);
        if (!book) {
            return HttpStatus.NOT_FOUND;
        }
        return {
            data: book[data],
        };
    }

    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getBook(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BookSchemaType | 404>> {
        const book = await this.bookService.getBook(id);
        if (book) {
            return res.send(book);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Post('')
    @UsePipes(new ZodValidationPipe(bookArgsSchema))
    async addBook(@Body() book: BookArgs): Promise<BookSchemaType | 500> {
        const newBook = await this.bookService.add(book);
        if (!newBook) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return newBook;
    }

    @Delete(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async deleteBook(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<200 | 404>> {
        const deleteStatus = await this.bookService.delete(id);
        if (deleteStatus) {
            return res.sendStatus(HttpStatus.OK);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Patch(':id')
    async updateBook(
        @Body(new ZodValidationPipe(partialBookArgsSchema))
        update: Partial<BookArgs>,
        @Param('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BookSchemaType | 404>> {
        const updatedBook = await this.bookService.update(id, update);
        if (updatedBook) {
            return res.send(updatedBook);
        }
        return res.status(HttpStatus.NOT_FOUND);
    }
}
