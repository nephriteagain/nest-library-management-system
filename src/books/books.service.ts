import { Injectable } from '@nestjs/common';
import { BookArgs, BookSchemaType } from 'src/types/models';
import BookSchema from 'src/db/schemas/book.schema';
import { ObjectId } from 'mongoose';



@Injectable()
export class BooksService {
    async add(book: BookArgs): Promise<BookSchemaType> {
        const newBook = await BookSchema.create(book);
        return newBook;
    }
    async getBook(id: ObjectId): Promise<BookSchemaType | null> {
        console.log(id, 'service');
        const book = await BookSchema.findById(id);
        return book;
    }
    async getBooks() : Promise<BookSchemaType[]>{
        return BookSchema.find({}).limit(20)
    }
    async delete(id: ObjectId) {
        const deleteStatus = await BookSchema.findByIdAndDelete(id);
        return Boolean(deleteStatus);
    }
    async update(
        id: ObjectId,
        update: Partial<BookArgs>,
    ): Promise<BookSchemaType | null> {
        const updatedBook = await BookSchema.findByIdAndUpdate(id, update, {
            new: true,
        });
        return updatedBook;
    }
}
