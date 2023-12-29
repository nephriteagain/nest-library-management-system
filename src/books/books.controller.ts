import { Controller, Post, Get, Param, Body, Delete, Patch, Res, HttpStatus } from '@nestjs/common';
import { BooksService } from './books.service';
import type { Book } from 'src/types/models';
import { Document, ObjectId } from 'mongoose';
import {  Response } from 'express';

@Controller('books')
export class BooksController {

    constructor(private bookService: BooksService) {}
    

    @Post('')
    async addBook(@Body() book:Book) {
        const newBook = await this.bookService.add(book)
        return newBook
    }

    

    @Delete(':id')
    async deleteBook(@Param('id') id:ObjectId, @Res() res: Response) {
        const deleteStatus = await this.bookService.delete(id)
        if (deleteStatus) {
            return res.sendStatus(HttpStatus.OK)
        }
        return res.sendStatus(HttpStatus.NOT_FOUND)
    }

    @Patch(':id')
    async updateBook(@Param('id') id:ObjectId, @Body() update: Partial<Book>, @Res() res: Response) {
        const updatedBook = await this.bookService.update(id, update)
        if (updatedBook) {
            return res.send(updatedBook)
        }
        return res.status(HttpStatus.NOT_FOUND)
    }

    @Get(':id')
    async getBook(@Param('id') id: ObjectId, @Res() res: Response) : Promise<Response<Document|{message:string}>> {
        const book = await this.bookService.getBook(id)
        if (book) {
            return res.send(book)
        }
        return res.status(HttpStatus.NOT_FOUND)
    }
}
