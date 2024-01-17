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
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import type { BookArgs, BookSchemaType } from '../types/models';
import { ObjectId } from 'mongoose';
import { Response } from 'express';
import {
    bookArgsSchema,
    zodOIDValidator,
    partialBookArgsSchema,
    zodOIDValidatorOptional,
} from '../types/models';
import { ZodValidationPipe } from '../db/validation/schema.pipe';

@Controller('api/books')
export class BooksController {
    constructor(private bookService: BooksService) {}

    @Get('')
    async getBooks(
        @Query('title') title?: string,
        @Query('authors') authors?: string,
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id?: ObjectId,
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
        const bookQuery = await this.bookService.search(q);
        return bookQuery;
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof BookSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: BookSchemaType[keyof BookSchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!');
        }
        const book = await this.bookService.getBook(_id);
        if (!book) {
            throw new NotFoundException();
        }
        if (book[data] === undefined) {
            throw new BadRequestException();
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
        if (!book) {
            throw new NotFoundException();
        }
        return res.send(book);
    }

    @Post('')
    @UsePipes(new ZodValidationPipe(bookArgsSchema))
    async addBook(@Body() book: BookArgs): Promise<BookSchemaType | 500> {
        const newBook = await this.bookService.add(book);
        if (!newBook) {
            throw new InternalServerErrorException();
        }
        return newBook;
    }

    @Delete(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async deleteBook(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<200>> {
        const deleteStatus = await this.bookService.delete(id);
        if (!deleteStatus) {
            throw new NotFoundException();
        }
        return res.sendStatus(HttpStatus.OK);
    }

    @Patch(':id')
    async updateBook(
        @Body(new ZodValidationPipe(partialBookArgsSchema))
        update: Partial<BookArgs>,
        @Param('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BookSchemaType>> {
        const updatedBook = await this.bookService.update(id, update);
        if (!updatedBook) {
            throw new NotFoundException();
        }
        return res.send(updatedBook);
    }
}
