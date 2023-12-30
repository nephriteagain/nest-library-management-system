import { Injectable } from '@nestjs/common';
import { Book, BaseDocument } from 'src/types/models';
import BookSchema from 'src/db/schemas/book.schema';
import { Document, ObjectId } from 'mongoose';

// TODO: fix BaseDocument not working


@Injectable()
export class BooksService {
    async add(book: Book): Promise<Document> {
        const newBook = await BookSchema.create(book);
        return newBook;
    }
    async getBook(id: ObjectId): Promise<Document | null> {
        console.log(id, 'service');
        const book = await BookSchema.findById(id);
        return book;
    }
    async getBooks() : Promise<Document[]>{
        return BookSchema.find({})
    }
    async delete(id: ObjectId) {
        const deleteStatus = await BookSchema.findByIdAndDelete(id);
        return Boolean(deleteStatus);
    }
    async update(
        id: ObjectId,
        update: Partial<Book>,
    ): Promise<Document | null> {
        const updatedBook = await BookSchema.findByIdAndUpdate(id, update, {
            new: true,
        });
        return updatedBook;
    }
}
